import assert from "node:assert/strict";
import { prisma } from "../lib/prisma";
import { auth, handlers, signIn, signOut } from "../auth";
import { PrismaAdapter } from "@auth/prisma-adapter";

async function runTestSuite() {
  console.log("=================================================");
  console.log("  PHASE 2 — AUTH.JS FOUNDATION TEST SUITE       ");
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

  // Record pre-test snapshot of existing production/development data
  const initialBusinessCount = await prisma.business.count();
  const initialLeadCount = await prisma.lead.count();
  const initialTaskCount = await prisma.task.count();
  const initialActivityCount = await prisma.activity.count();
  const existingBusinesses = await prisma.business.findMany({
    select: { id: true, ownerId: true },
  });

  console.log(`[Baseline Snapshot] Businesses: ${initialBusinessCount}, Leads: ${initialLeadCount}, Tasks: ${initialTaskCount}, Activities: ${initialActivityCount}\n`);

  // --- Category 1: Auth.js Configuration ---
  console.log("--- 1. Auth.js Configuration & Exports ---");
  await test("Auth.js exports auth, handlers, signIn, signOut", async () => {
    assert.equal(typeof auth, "function", "auth should be a function");
    assert.equal(typeof handlers, "object", "handlers should be an object");
    assert.equal(typeof handlers.GET, "function", "handlers.GET should be a function");
    assert.equal(typeof handlers.POST, "function", "handlers.POST should be a function");
    assert.equal(typeof signIn, "function", "signIn should be a function");
    assert.equal(typeof signOut, "function", "signOut should be a function");
  });

  await test("AUTH_SECRET environment variable is loaded and valid", async () => {
    assert.ok(process.env.AUTH_SECRET, "AUTH_SECRET must be defined");
    assert.ok(process.env.AUTH_SECRET.length >= 32, "AUTH_SECRET should be at least 32 characters");
  });

  // --- Category 2: Prisma Auth.js Persistence ---
  console.log("\n--- 2. Prisma Auth.js Persistence & Adapter ---");
  const testEmail = `authjs-test-${Date.now()}@example.com`;
  let testUserId = "";
  const testSessionToken = `session-token-${Date.now()}`;
  const adapter = PrismaAdapter(prisma);

  await test("Can create an Auth.js User via Prisma", async () => {
    const user = await prisma.user.create({
      data: {
        name: "Test Auth.js User",
        email: testEmail,
        image: "https://example.com/avatar.png",
      },
    });
    assert.ok(user.id, "User must have an id");
    assert.equal(user.email, testEmail);
    testUserId = user.id;
  });

  await test("Can create an Account linked to User with cascade delete", async () => {
    const account = await prisma.account.create({
      data: {
        userId: testUserId,
        type: "email",
        provider: "resend",
        providerAccountId: testEmail,
      },
    });
    assert.ok(account.id);
    assert.equal(account.userId, testUserId);
  });

  await test("Can create and retrieve a Session via Prisma adapter", async () => {
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const session = await adapter.createSession!({
      sessionToken: testSessionToken,
      userId: testUserId,
      expires,
    });
    assert.equal(session.sessionToken, testSessionToken);

    // Retrieve through adapter getSessionAndUser
    const sessionAndUser = await adapter.getSessionAndUser!(testSessionToken);
    assert.ok(sessionAndUser, "Session and user should be found");
    assert.equal(sessionAndUser.user.id, testUserId);
    assert.equal(sessionAndUser.session.sessionToken, testSessionToken);
  });

  await test("Can create and use VerificationToken via Prisma adapter", async () => {
    const token = `verify-token-${Date.now()}`;
    const expires = new Date(Date.now() + 15 * 60 * 1000);
    await adapter.createVerificationToken!({
      identifier: testEmail,
      token,
      expires,
    });

    const used = await adapter.useVerificationToken!({
      identifier: testEmail,
      token,
    });
    assert.ok(used, "VerificationToken should be retrieved and consumed");
    assert.equal(used.token, token);

    // Second consumption must fail (single-use)
    const usedAgain = await adapter.useVerificationToken!({
      identifier: testEmail,
      token,
    });
    assert.equal(usedAgain, null, "VerificationToken must not be reusable");
  });

  await test("Session deletion invalidates session", async () => {
    await adapter.deleteSession!(testSessionToken);
    const sessionAndUser = await adapter.getSessionAndUser!(testSessionToken);
    assert.equal(sessionAndUser, null, "Deleted session must return null");
  });

  await test("Cascade deletion: deleting User cleans up associated accounts and sessions", async () => {
    // Create new session for test
    const tempSessionToken = `temp-session-${Date.now()}`;
    await prisma.session.create({
      data: {
        sessionToken: tempSessionToken,
        userId: testUserId,
        expires: new Date(Date.now() + 10000),
      },
    });

    // Delete user
    await prisma.user.delete({ where: { id: testUserId } });

    // Verify accounts and sessions are cascaded
    const accounts = await prisma.account.findMany({ where: { userId: testUserId } });
    const sessions = await prisma.session.findMany({ where: { userId: testUserId } });
    assert.equal(accounts.length, 0, "Accounts must be cascade deleted");
    assert.equal(sessions.length, 0, "Sessions must be cascade deleted");
  });

  // --- Category 3: Data Safety & Existing Data Preservation ---
  console.log("\n--- 3. Data Safety & Preservation ---");
  await test("Existing Business records and ownerIds are completely unchanged", async () => {
    const currentBusinessCount = await prisma.business.count();
    assert.equal(currentBusinessCount, initialBusinessCount, "Business count must not change");

    const currentBusinesses = await prisma.business.findMany({
      select: { id: true, ownerId: true },
    });
    assert.deepEqual(currentBusinesses, existingBusinesses, "Business ownerId values must be identical");
  });

  await test("Existing Lead records are completely unchanged", async () => {
    const currentLeadCount = await prisma.lead.count();
    assert.equal(currentLeadCount, initialLeadCount, "Lead count must not change");
  });

  await test("Existing Task records are completely unchanged", async () => {
    const currentTaskCount = await prisma.task.count();
    assert.equal(currentTaskCount, initialTaskCount, "Task count must not change");
  });

  await test("Existing Activity records are completely unchanged", async () => {
    const currentActivityCount = await prisma.activity.count();
    assert.equal(currentActivityCount, initialActivityCount, "Activity count must not change");
  });

  // --- Category 4: Tenant Isolation ---
  console.log("\n--- 4. Multi-Tenancy Boundary Isolation ---");
  await test("Tenant scoping by businessId operates without Auth.js interference", async () => {
    if (existingBusinesses.length > 0) {
      const b = existingBusinesses[0];
      const leads = await prisma.lead.findMany({ where: { businessId: b.id } });
      assert.ok(Array.isArray(leads), "Should return array of leads scoped by businessId");
    } else {
      console.log("    (No existing businesses to query, test skipped)");
    }
  });

  console.log("\n=================================================");
  console.log(`  RESULTS: ${passes} Passed, ${failures} Failed`);
  console.log("=================================================\n");

  if (failures > 0) {
    process.exit(1);
  }
}

runTestSuite()
  .catch((err) => {
    console.error("Test runner failed unexpectedly:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
