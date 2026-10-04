import assert from "node:assert/strict";
import { prisma } from "../lib/prisma";
import {
  getCurrentUser,
  requireCurrentUser,
  resolveOwnerEmail,
  UnauthorizedError,
} from "../src/server/services/auth.service";
import { listLeads } from "../src/server/services/lead.service";
import { listTasks } from "../src/server/services/task.service";
import { POST as leadsPostHandler } from "../app/api/leads/route";
import { GET as leadsExportGetHandler } from "../app/api/leads/export/route";
import { PrismaAdapter } from "@auth/prisma-adapter";

async function runIntegrationTests() {
  console.log("=================================================");
  console.log("  PHASE 3 — AUTH.JS APPLICATION INTEGRATION TESTS ");
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

  // Pre-test data snapshot
  const baselineBusinesses = await prisma.business.findMany({
    select: { id: true, ownerId: true, name: true },
  });
  const baselineBusinessCount = baselineBusinesses.length;
  const baselineLeadCount = await prisma.lead.count();
  const baselineTaskCount = await prisma.task.count();
  const baselineActivityCount = await prisma.activity.count();

  console.log(`[Baseline Data] Businesses: ${baselineBusinessCount}, Leads: ${baselineLeadCount}, Tasks: ${baselineTaskCount}, Activities: ${baselineActivityCount}\n`);

  // --- Category 1: Auth Abstraction ---
  console.log("--- 1. Auth Abstraction Behavior ---");
  await test("getCurrentUser returns null in unauthenticated context", async () => {
    const user = await getCurrentUser();
    assert.equal(user, null, "Should return null when no session is present");
  });

  await test("requireCurrentUser throws UnauthorizedError when unauthenticated", async () => {
    await assert.rejects(
      async () => {
        await requireCurrentUser();
      },
      (err: unknown) => {
        assert.ok(err instanceof UnauthorizedError, "Should be instance of UnauthorizedError");
        assert.equal(err.statusCode, 401);
        return true;
      }
    );
  });

  // --- Category 2: Authenticated API Routes ---
  console.log("\n--- 2. Authenticated API Routes Protection ---");
  await test("POST /api/leads returns 401 Unauthorized when unauthenticated", async () => {
    const req = new Request("http://localhost:3000/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Unauthenticated Test Lead" }),
    });
    const res = await leadsPostHandler(req);
    assert.equal(res.status, 401, "POST /api/leads must return HTTP 401");
    const json = await res.json();
    assert.ok(json.error, "Must include error message");
  });

  await test("GET /api/leads/export returns 401 Unauthorized when unauthenticated", async () => {
    const req = new Request("http://localhost:3000/api/leads/export", {
      method: "GET",
    });
    const res = await leadsExportGetHandler(req);
    assert.equal(res.status, 401, "GET /api/leads/export must return HTTP 401");
    const json = await res.json();
    assert.ok(json.error, "Must include error message");
  });

  // --- Category 3: Multi-Tenancy Boundary Isolation ---
  console.log("\n--- 3. Multi-Tenancy Boundary Isolation ---");
  await test("Tenant isolation: User A cannot access Business B leads or tasks", async () => {
    const tenantA_ownerId = `test_owner_A_${Date.now()}`;
    const tenantB_ownerId = `test_owner_B_${Date.now()}`;

    // Create 2 test businesses
    const businessA = await prisma.business.create({
      data: { ownerId: tenantA_ownerId, name: "Tenant A Clinic" },
    });
    const businessB = await prisma.business.create({
      data: { ownerId: tenantB_ownerId, name: "Tenant B Salon" },
    });

    try {
      // Create leads for A and B
      const leadA = await prisma.lead.create({
        data: {
          businessId: businessA.id,
          name: "Lead For Business A",
          source: "WEBSITE",
          status: "NEW",
        },
      });
      const leadB = await prisma.lead.create({
        data: {
          businessId: businessB.id,
          name: "Lead For Business B",
          source: "WHATSAPP",
          status: "NEW",
        },
      });

      // Create tasks for A and B
      await prisma.task.create({
        data: {
          leadId: leadA.id,
          type: "FOLLOW_UP",
          dueAt: new Date(),
        },
      });
      await prisma.task.create({
        data: {
          leadId: leadB.id,
          type: "CALL",
          dueAt: new Date(),
        },
      });

      // Verify listLeads for Business A returns only leadA
      const leadsForA = await listLeads(businessA.id);
      assert.equal(leadsForA.length, 1);
      assert.equal(leadsForA[0].id, leadA.id);
      assert.equal(leadsForA[0].name, "Lead For Business A");

      // Verify listLeads for Business B returns only leadB
      const leadsForB = await listLeads(businessB.id);
      assert.equal(leadsForB.length, 1);
      assert.equal(leadsForB[0].id, leadB.id);
      assert.equal(leadsForB[0].name, "Lead For Business B");

      // Verify listTasks for Business A contains zero tasks belonging to B
      const tasksForA = await listTasks(businessA.id);
      assert.equal(tasksForA.length, 1);
      assert.equal(tasksForA[0].leadId, leadA.id);

      const tasksForB = await listTasks(businessB.id);
      assert.equal(tasksForB.length, 1);
      assert.equal(tasksForB[0].leadId, leadB.id);
    } finally {
      // Cleanup test tenants
      await prisma.business.deleteMany({
        where: { id: { in: [businessA.id, businessB.id] } },
      });
    }
  });

  // --- Category 4: Business Resolution & Unassigned Tenant Protection ---
  console.log("\n--- 4. Business Resolution & Unassigned Tenant Safety ---");
  await test("Unmapped Auth.js user does not auto-create a business or hijack Clerk tenants", async () => {
    const testAuthUser = await prisma.user.create({
      data: {
        name: "Unassigned Auth User",
        email: `unassigned-${Date.now()}@example.com`,
      },
    });

    try {
      // Check business lookup for this Auth.js user
      const existing = await prisma.business.findUnique({
        where: { ownerId: testAuthUser.id },
      });
      assert.equal(existing, null, "Should have no pre-existing business");

      // Verify business count remains identical to baseline
      const currentBusinessCount = await prisma.business.count();
      assert.equal(currentBusinessCount, baselineBusinessCount, "Business count must not increase automatically");
    } finally {
      await prisma.user.delete({ where: { id: testAuthUser.id } });
    }
  });

  // --- Category 5: Business Ownership & Data Integrity ---
  console.log("\n--- 5. Business Ownership & Data Integrity ---");
  await test("Existing Business records have valid Auth.js ownerIds and zero orphaned records", async () => {
    const currentBusinesses = await prisma.business.findMany({
      select: { id: true, ownerId: true, name: true },
    });
    assert.equal(currentBusinesses.length, baselineBusinessCount, "Business count must match baseline");

    const allUsers = await prisma.user.findMany({ select: { id: true } });
    const userIds = new Set(allUsers.map((u) => u.id));
    for (const b of currentBusinesses) {
      assert.ok(userIds.has(b.ownerId), `Business ${b.id} ownerId ${b.ownerId} must reference a valid Auth.js User`);
    }
  });

  await test("Existing Leads, Tasks, and Activities remain 100% unchanged", async () => {
    const currentLeads = await prisma.lead.count();
    const currentTasks = await prisma.task.count();
    const currentActivities = await prisma.activity.count();

    assert.equal(currentLeads, baselineLeadCount, "Lead count must be identical");
    assert.equal(currentTasks, baselineTaskCount, "Task count must be identical");
    assert.equal(currentActivities, baselineActivityCount, "Activity count must be identical");
  });

  // --- Category 6: Email / Digest Compatibility ---
  console.log("\n--- 6. Email / Digest Compatibility ---");
  await test("resolveOwnerEmail resolves local Auth.js user email directly from DB", async () => {
    const testEmail = `local-owner-${Date.now()}@example.com`;
    const localUser = await prisma.user.create({
      data: {
        name: "Local DB Owner",
        email: testEmail,
      },
    });

    try {
      const resolved = await resolveOwnerEmail(localUser.id);
      assert.equal(resolved, testEmail, "Must resolve email directly from PostgreSQL users table");
    } finally {
      await prisma.user.delete({ where: { id: localUser.id } });
    }
  });

  await test("resolveOwnerEmail gracefully handles unknown ownerId without uncaught crash", async () => {
    const nonExistentOwnerId = "non_existent_owner_999999999";
    const resolved = await resolveOwnerEmail(nonExistentOwnerId);
    // Should return null gracefully instead of throwing
    assert.equal(resolved, null, "Should return null for non-existent owner");
  });

  // --- Category 7: Auth.js Session Lifecycle ---
  console.log("\n--- 7. Auth.js Session Lifecycle ---");
  await test("Auth.js database session creation, verification, and revocation", async () => {
    const adapter = PrismaAdapter(prisma);
    const user = await prisma.user.create({
      data: {
        name: "Session Lifecycle User",
        email: `session-${Date.now()}@example.com`,
      },
    });

    const sessionToken = `integration-token-${Date.now()}`;
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    try {
      // Create session
      await adapter.createSession!({
        userId: user.id,
        sessionToken,
        expires,
      });

      // Retrieve session
      const sessionAndUser = await adapter.getSessionAndUser!(sessionToken);
      assert.ok(sessionAndUser, "Session must exist");
      assert.equal(sessionAndUser.user.id, user.id);

      // Invalidate / Sign out
      await adapter.deleteSession!(sessionToken);
      const afterSignOut = await adapter.getSessionAndUser!(sessionToken);
      assert.equal(afterSignOut, null, "Session must be null after deleteSession");
    } finally {
      await prisma.user.delete({ where: { id: user.id } });
    }
  });

  console.log("\n=================================================");
  console.log(`  INTEGRATION TEST RESULTS: ${passes} Passed, ${failures} Failed`);
  console.log("=================================================\n");

  if (failures > 0) {
    process.exit(1);
  }
}

runIntegrationTests()
  .catch((err) => {
    console.error("Integration test runner crashed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
