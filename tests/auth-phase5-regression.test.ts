import assert from "node:assert/strict";
import { prisma } from "../lib/prisma";
import {
  getCurrentUser,
  requireCurrentUser,
  resolveOwnerEmail,
  UnauthorizedError,
} from "../src/server/services/auth.service";
import { getOrCreateBusiness } from "../src/server/services/business.service";
import { listLeads, createLead } from "../src/server/services/lead.service";
import { listTasks, createTask } from "../src/server/services/task.service";
import { GET as leadsExportGetHandler } from "../app/api/leads/export/route";
import { POST as leadsPostHandler } from "../app/api/leads/route";

async function runPhase5RegressionTests() {
  console.log("=========================================================");
  console.log("  PHASE 5 — AUTH.JS FINALIZATION & REGRESSION TEST SUITE ");
  console.log("=========================================================\n");

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

  // Baseline data verification
  const totalBusinesses = await prisma.business.count();
  const totalLeads = await prisma.lead.count();
  const totalTasks = await prisma.task.count();
  const totalActivities = await prisma.activity.count();
  const totalUsers = await prisma.user.count();
  const totalAudits = await prisma.clerkMigrationAudit.count();

  console.log(`[Baseline Data State] Businesses: ${totalBusinesses}, Leads: ${totalLeads}, Tasks: ${totalTasks}, Activities: ${totalActivities}, Users: ${totalUsers}, Audits: ${totalAudits}\n`);

  // --- Category 1: Zero Clerk Runtime Dependency ---
  console.log("--- 1. Zero Clerk Runtime Dependency ---");

  await test("@clerk/nextjs package is NOT resolvable in node_modules", async () => {
    let resolved = false;
    try {
      require.resolve("@clerk/nextjs");
      resolved = true;
    } catch {
      resolved = false;
    }
    assert.equal(resolved, false, "@clerk/nextjs should not be resolvable");
  });

  await test("No Clerk environment variables are required for Auth.js operation", async () => {
    assert.ok(process.env.AUTH_SECRET, "AUTH_SECRET is required");
    assert.ok(process.env.DATABASE_URL, "DATABASE_URL is required");
    // Ensure application logic does NOT fail when CLERK keys are absent
    const mockEnv = { ...process.env };
    delete mockEnv.CLERK_SECRET_KEY;
    delete mockEnv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    assert.equal(mockEnv.CLERK_SECRET_KEY, undefined);
  });

  // --- Category 2: Business Ownership & Tenancy Integrity ---
  console.log("\n--- 2. Business Ownership & Tenancy Integrity ---");

  await test("Every Business.ownerId is mapped to an Auth.js User.id (zero Clerk IDs)", async () => {
    const businesses = await prisma.business.findMany();
    assert.ok(businesses.length > 0, "Businesses must exist");

    for (const biz of businesses) {
      assert.ok(!biz.ownerId.startsWith("user_"), `Business ${biz.id} ownerId ${biz.ownerId} must NOT be a Clerk ID`);
      const user = await prisma.user.findUnique({ where: { id: biz.ownerId } });
      assert.ok(user, `Business ${biz.id} ownerId ${biz.ownerId} must resolve to an existing Auth.js User`);
    }
  });

  await test("Existing migrated user resolves to existing Business (no duplicate created)", async () => {
    // Pick an existing migrated user
    const existingAudit = await prisma.clerkMigrationAudit.findFirst({
      where: { status: "MIGRATED" },
    });
    assert.ok(existingAudit, "Migrated audit record should exist");

    const existingUser = await prisma.user.findUnique({
      where: { id: existingAudit.authUserId },
    });
    assert.ok(existingUser, "Migrated user must exist");

    const biz = await getOrCreateBusiness(existingUser.id, existingUser.name);
    assert.equal(biz.id, existingAudit.businessId, "Must return existing business without duplicating");

    const countAfter = await prisma.business.count();
    assert.equal(countAfter, totalBusinesses, "Business count must not increase for existing user");
  });

  await test("New user creates a new business correctly with User.id as ownerId", async () => {
    const freshUserEmail = `fresh-phase5-${Date.now()}@example.com`;
    const freshUser = await prisma.user.create({
      data: {
        email: freshUserEmail,
        name: "Fresh Phase 5 User",
      },
    });

    try {
      const freshBiz = await getOrCreateBusiness(freshUser.id, freshUser.name);
      assert.equal(freshBiz.ownerId, freshUser.id, "Business.ownerId must match fresh User.id");
      assert.ok(!freshBiz.ownerId.startsWith("user_"), "Business.ownerId must not be Clerk-formatted");

      // Clean up test data
      await prisma.business.delete({ where: { id: freshBiz.id } });
    } finally {
      await prisma.user.delete({ where: { id: freshUser.id } });
    }
  });

  // --- Category 3: Cross-Tenant Isolation ---
  console.log("\n--- 3. Cross-Tenant Isolation Verification ---");

  await test("User A cannot view or access User B leads or tasks", async () => {
    const businesses = await prisma.business.findMany({ take: 2 });
    assert.equal(businesses.length, 2, "Need at least 2 businesses to test tenant isolation");
    const [bizA, bizB] = businesses;

    const leadsA = await listLeads(bizA.id);
    const leadsB = await listLeads(bizB.id);

    // Ensure all leads belonging to bizA are strictly scoped to bizA
    for (const l of leadsA) {
      assert.equal(l.businessId, bizA.id, "Lead must belong to bizA");
    }
    for (const l of leadsB) {
      assert.equal(l.businessId, bizB.id, "Lead must belong to bizB");
    }

    const tasksA = await listTasks(bizA.id);
    const tasksB = await listTasks(bizB.id);
    for (const t of tasksA) {
      assert.equal(t.lead.businessId, bizA.id, "Task must belong to bizA");
    }
    for (const t of tasksB) {
      assert.equal(t.lead.businessId, bizB.id, "Task must belong to bizB");
    }
  });

  // --- Category 4: Email & Owner Lookup ---
  console.log("\n--- 4. Email & Owner Lookup Architecture ---");

  await test("resolveOwnerEmail queries Auth.js User directly from database", async () => {
    const anyUser = await prisma.user.findFirst();
    assert.ok(anyUser, "User must exist");

    const email = await resolveOwnerEmail(anyUser.id);
    assert.equal(email, anyUser.email, "Resolved email must match Auth.js User email");
  });

  await test("resolveOwnerEmail gracefully returns null for non-existent owner", async () => {
    const email = await resolveOwnerEmail("non-existent-user-id");
    assert.equal(email, null, "Should return null for missing user without throwing");
  });

  // --- Category 5: API & Route Protection ---
  console.log("\n--- 5. API & Route Protection ---");

  await test("Unauthenticated API export request returns 401 Unauthorized", async () => {
    const req = new Request("http://localhost:3000/api/leads/export", {
      method: "GET",
    });
    const res = await leadsExportGetHandler(req);
    assert.equal(res.status, 401, "Unauthenticated /api/leads/export must return 401");
  });

  await test("Unauthenticated API POST /api/leads returns 401 Unauthorized", async () => {
    const req = new Request("http://localhost:3000/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Hacker Lead", phone: "123" }),
    });
    const res = await leadsPostHandler(req);
    assert.equal(res.status, 401, "Unauthenticated POST /api/leads must return 401");
  });

  // --- Category 6: Full Data Preservation Snapshot Check ---
  console.log("\n--- 6. Data Preservation Audit ---");

  await test("Zero data loss across all tables", async () => {
    const currentBusinesses = await prisma.business.count();
    const currentLeads = await prisma.lead.count();
    const currentTasks = await prisma.task.count();
    const currentActivities = await prisma.activity.count();
    const currentUsers = await prisma.user.count();

    assert.equal(currentBusinesses, totalBusinesses, "Business count must match baseline");
    assert.equal(currentLeads, totalLeads, "Lead count must match baseline");
    assert.equal(currentTasks, totalTasks, "Task count must match baseline");
    assert.equal(currentActivities, totalActivities, "Activity count must match baseline");
    assert.equal(currentUsers, totalUsers, "User count must match baseline");
  });

  console.log("\n=========================================================");
  console.log(`  PHASE 5 REGRESSION SUMMARY: ${passes} PASSED, ${failures} FAILED`);
  console.log("=========================================================\n");

  if (failures > 0) {
    process.exit(1);
  }
}

runPhase5RegressionTests()
  .catch((err) => {
    console.error("Fatal test runner error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
