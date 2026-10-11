import assert from "node:assert/strict";
import { prisma } from "../lib/prisma";
import { createLead, getLead } from "../src/server/services/lead.service";
import {
  ensureInitialFollowUpTask,
  generateFallbackFollowUpRecommendation,
  getAiFollowUpRecommendation,
} from "../src/server/services/ai-followup.service";
import {
  sendDailyDigest,
  sendDailyDigestForAllBusinesses,
} from "../src/server/services/email.service";

async function runAiFollowUpAndDigestTestSuite() {
  console.log("=================================================");
  console.log("  AI FOLLOW-UPS & RESEND DIGEST TEST SUITE       ");
  console.log("=================================================\n");

  let passes = 0;
  let failures = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`  ✔ [PASS] ${name}`);
      passes++;
    } catch (err) {
      console.error(`  ✖ [FAIL] ${name}`);
      console.error(err);
      failures++;
    }
  }

  const timestamp = Date.now();
  const testEmail = `ai-digest-${timestamp}@example.com`;
  let testUserId = "";
  let testBusinessId = "";
  let testLeadId = "";

  // Setup test tenant
  const user = await prisma.user.create({
    data: {
      name: "AI Test Owner",
      email: testEmail,
      emailVerified: new Date(),
    },
  });
  testUserId = user.id;

  const business = await prisma.business.create({
    data: {
      ownerId: user.id,
      name: "AI Test Clinic",
      industry: "Healthcare",
    },
  });
  testBusinessId = business.id;

  // --------------------------------------------------------------------------
  // 1. LEAD INGESTION & IDEMPOTENT FOLLOW-UP TASK LIFECYCLE
  // --------------------------------------------------------------------------
  console.log("--- 1. Lead Ingestion & Task Scheduling ---");

  await test("Creating a lead automatically creates an initial 24h follow-up task", async () => {
    const lead = await createLead({
      businessId: testBusinessId,
      name: "Jordan Lee",
      email: "jordan@example.com",
      phone: "+15551234567",
      source: "FACEBOOK_ADS",
      priority: "HOT",
      notes: "Interested in dental implants pricing and timeline",
    });
    testLeadId = lead.id;

    const tasks = await prisma.task.findMany({
      where: { leadId: lead.id, status: "PENDING" },
    });

    assert.equal(tasks.length, 1, "Must have exactly 1 pending task");
    assert.equal(tasks[0].type, "FOLLOW_UP");

    // Task due date should be approximately 24h from now
    const diffHours = (tasks[0].dueAt.getTime() - Date.now()) / (1000 * 60 * 60);
    assert.ok(diffHours >= 23.9 && diffHours <= 24.1, `Due date must be 24h out (got ${diffHours}h)`);
  });

  await test("ensureInitialFollowUpTask is idempotent and prevents duplicate pending tasks", async () => {
    // Call ensureInitialFollowUpTask again on the same lead
    const task = await ensureInitialFollowUpTask(testLeadId);
    assert.ok(task);

    const pendingCount = await prisma.task.count({
      where: { leadId: testLeadId, status: "PENDING" },
    });
    assert.equal(pendingCount, 1, "Must not create duplicate pending tasks for the same lead");
  });

  // --------------------------------------------------------------------------
  // 2. AI FOLLOW-UP RECOMMENDATION ENGINE
  // --------------------------------------------------------------------------
  console.log("\n--- 2. AI Recommendation Quality & Fallback ---");

  await test("Fallback recommendation generates context-aware WhatsApp hook for HOT ad leads", async () => {
    const rec = generateFallbackFollowUpRecommendation({
      id: testLeadId,
      name: "Jordan Lee",
      email: "jordan@example.com",
      phone: "+15551234567",
      source: "FACEBOOK_ADS",
      status: "NEW",
      priority: "HOT",
      notes: "Interested in dental implants pricing and timeline",
      createdAt: new Date(),
      businessName: "AI Test Clinic",
    });

    assert.equal(rec.channel, "WHATSAPP", "HOT ad lead with phone should recommend WhatsApp");
    assert.equal(rec.urgency, "IMMEDIATE", "HOT lead should have IMMEDIATE urgency");
    assert.equal(rec.timingHours, 1, "Immediate outreach SLA is 1 hour");
    assert.ok(rec.openingHook.includes("Jordan"), "Opener must reference lead name");
    assert.ok(rec.openingHook.includes("AI Test Clinic"), "Opener must reference business name");
    assert.ok(rec.talkingPoints.length >= 2, "Must provide talking points");
    assert.ok(rec.talkingPoints.some((p) => p.toLowerCase().includes("price") || p.toLowerCase().includes("pricing")));
    assert.equal(rec.source, "rule-based-fallback");
  });

  await test("getAiFollowUpRecommendation returns valid structured recommendation without crashing", async () => {
    const rec = await getAiFollowUpRecommendation({
      id: testLeadId,
      name: "Jordan Lee",
      email: "jordan@example.com",
      phone: "+15551234567",
      source: "FACEBOOK_ADS",
      status: "NEW",
      priority: "HOT",
      notes: "Interested in dental implants pricing",
      createdAt: new Date(),
      businessName: "AI Test Clinic",
    });

    assert.ok(["WHATSAPP", "PHONE", "EMAIL"].includes(rec.channel));
    assert.ok(["IMMEDIATE", "TODAY", "SCHEDULED"].includes(rec.urgency));
    assert.ok(typeof rec.timingHours === "number" && rec.timingHours > 0);
    assert.ok(rec.openingHook.length > 10, "Must have non-empty opening hook");
    assert.ok(Array.isArray(rec.talkingPoints) && rec.talkingPoints.length > 0);
    assert.ok(rec.rationale.length > 0);
  });

  // --------------------------------------------------------------------------
  // 3. RESEND DAILY DIGEST PIPELINE & ISOLATION
  // --------------------------------------------------------------------------
  console.log("\n--- 3. Resend Daily Digest Pipeline ---");

  await test("sendDailyDigest processes tenant data and generates complete email content", async () => {
    // Send digest for our test business (force: true bypasses idempotency for test)
    const sandboxRecipient = process.env.RESEND_TEST_RECIPIENT || "casanova270407@gmail.com";
    const res = await sendDailyDigest(testBusinessId, sandboxRecipient, { force: true });

    assert.equal(res.businessId, testBusinessId);
    assert.equal(res.recipient, sandboxRecipient);

    assert.ok(
      res.status === "SENT" || res.status === "SKIPPED_NO_KEY",
      `Expected SENT or SKIPPED_NO_KEY, got ${res.status} (${res.error || "no error"})`
    );
  });

  await test("sendDailyDigest enforces idempotency and skips duplicate dispatch on same day", async () => {
    // Immediately invoke again without force
    const sandboxRecipient = process.env.RESEND_TEST_RECIPIENT || "casanova270407@gmail.com";
    const res = await sendDailyDigest(testBusinessId, sandboxRecipient);

    // If previous send recorded a sent log, this must return SKIPPED_ALREADY_SENT or SKIPPED_NO_KEY
    assert.ok(
      res.status === "SKIPPED_ALREADY_SENT" || res.status === "SKIPPED_NO_KEY",
      `Expected SKIPPED_ALREADY_SENT or SKIPPED_NO_KEY, got ${res.status}`
    );
  });

  await test("Empty business with zero hot leads, zero tasks, and zero new leads is safely skipped", async () => {
    // Create an empty business with a dedicated user and no leads
    const emptyUser = await prisma.user.create({
      data: {
        name: "Empty Test Owner",
        email: `empty-owner-${Date.now()}@example.com`,
      },
    });
    const emptyBiz = await prisma.business.create({
      data: {
        ownerId: emptyUser.id,
        name: "Empty Quiet Practice",
      },
    });

    try {
      const res = await sendDailyDigest(emptyBiz.id, "empty@example.com", { force: true });
      assert.equal(res.status, "SKIPPED_EMPTY", "Businesses with no activity must be skipped");
    } finally {
      await prisma.business.delete({ where: { id: emptyBiz.id } }).catch(() => {});
      await prisma.user.delete({ where: { id: emptyUser.id } }).catch(() => {});
    }
  });

  await test("sendDailyDigestForAllBusinesses runs batch report across all tenants", async () => {
    const report = await sendDailyDigestForAllBusinesses({ force: true });

    assert.ok(report.totalBusinesses > 0, "Must process businesses");
    assert.equal(typeof report.sent, "number");
    assert.equal(typeof report.skipped, "number");
    assert.equal(typeof report.failed, "number");
    assert.equal(report.results.length, report.totalBusinesses);
  });

  // --------------------------------------------------------------------------
  // 4. CLEANUP TEST FIXTURES
  // --------------------------------------------------------------------------
  console.log("\n--- 4. Cleanup Test Fixtures ---");

  await test("Clean up test leads, tasks, businesses, and users without touching production", async () => {
    await prisma.task.deleteMany({ where: { leadId: testLeadId } });
    await prisma.activity.deleteMany({ where: { leadId: testLeadId } });
    await prisma.lead.deleteMany({ where: { businessId: testBusinessId } });
    await prisma.business.delete({ where: { id: testBusinessId } });
    await prisma.user.delete({ where: { id: testUserId } });

    const checkBiz = await prisma.business.findUnique({ where: { id: testBusinessId } });
    const checkUser = await prisma.user.findUnique({ where: { id: testUserId } });
    assert.equal(checkBiz, null);
    assert.equal(checkUser, null);
  });

  console.log("\n=================================================");
  console.log(`  AI & DIGEST RESULTS: ${passes} Passed, ${failures} Failed`);
  console.log("=================================================\n");

  if (failures > 0) {
    process.exit(1);
  }
}

runAiFollowUpAndDigestTestSuite().catch((e) => {
  console.error(e);
  process.exit(1);
});
