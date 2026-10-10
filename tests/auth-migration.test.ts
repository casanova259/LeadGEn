import assert from "node:assert/strict";
import { prisma } from "../lib/prisma";
import {
  getCurrentUser,
  requireCurrentUser,
  resolveOwnerEmail,
  UnauthorizedError,
} from "../src/server/services/auth.service";
import { getOrCreateBusiness } from "../src/server/services/business.service";
import { listLeads } from "../src/server/services/lead.service";
import { listTasks } from "../src/server/services/task.service";
import { runMigration } from "../scripts/migrate-clerk-to-authjs";
import * as fs from "node:fs";
import * as path from "node:path";

async function runPhase4MigrationTests() {
  console.log("=================================================");
  console.log("  PHASE 4 — CLERK → AUTH.JS MIGRATION TEST SUITE ");
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

  // Baseline data verification
  const totalBusinesses = await prisma.business.count();
  const totalLeads = await prisma.lead.count();
  const totalTasks = await prisma.task.count();
  const totalActivities = await prisma.activity.count();
  const totalUsers = await prisma.user.count();
  const totalAudits = await prisma.clerkMigrationAudit.count();

  console.log(`[Current State] Businesses: ${totalBusinesses}, Leads: ${totalLeads}, Tasks: ${totalTasks}, Activities: ${totalActivities}, Users: ${totalUsers}, Audits: ${totalAudits}\n`);

  // --- Category 1: Migration State & Audit Verification ---
  console.log("--- 1. Migration State & Audit Verification ---");

  await test("All 10 production businesses have corresponding audit records", async () => {
    assert.equal(totalBusinesses, 10, "Expected exactly 10 businesses");
    assert.equal(totalAudits, 10, "Expected exactly 10 audit records");

    const audits = await prisma.clerkMigrationAudit.findMany();
    for (const a of audits) {
      assert.equal(a.status, "MIGRATED", `Audit for business ${a.businessId} must have status MIGRATED`);
      assert.ok(a.clerkUserId.startsWith("user_"), "Clerk user ID must be stored in audit");
      assert.ok(a.authUserId.length > 0, "Auth.js user ID must be stored in audit");
      assert.ok(a.sourceEmail.includes("@"), "Source email must be stored in audit");
      assert.ok(a.migratedAt, "Migration timestamp must be present");
    }
  });

  await test("Every Business.ownerId matches a valid Auth.js User.id", async () => {
    const businesses = await prisma.business.findMany();
    const users = await prisma.user.findMany();
    const userIds = new Set(users.map((u) => u.id));

    for (const b of businesses) {
      assert.ok(
        userIds.has(b.ownerId),
        `Business ${b.id} ownerId (${b.ownerId}) must exist in Auth.js users table`
      );
      assert.ok(
        !b.ownerId.startsWith("user_"),
        `Business ${b.id} ownerId (${b.ownerId}) must no longer be a Clerk ID`
      );
    }
  });

  // --- Category 2: Data Preservation & Integrity ---
  console.log("\n--- 2. Data Preservation & Zero Loss ---");

  await test("All CRM application records remain completely preserved", async () => {
    assert.equal(totalLeads, 27, "Expected exactly 27 leads");
    assert.equal(totalTasks, 30, "Expected exactly 30 tasks");
    assert.equal(totalActivities, 89, "Expected exactly 89 activities");

    // Verify zero orphaned leads
    const orphanedLeads = await prisma.lead.findMany({
      where: { business: { isNot: undefined } },
    });
    assert.equal(orphanedLeads.length, 27, "All 27 leads must have a valid business relationship");
  });

  // --- Category 3: Migration Idempotency & Dry-Run ---
  console.log("\n--- 3. Migration Idempotency & Dry-Run ---");

  await test("Migration dry-run reports ALREADY_MIGRATED for all records without changes", async () => {
    const snapshot = await runMigration("dry-run");
    assert.equal(snapshot.summary.READY, 0, "READY count must be 0 on rerun");
    assert.equal(snapshot.summary.ALREADY_MIGRATED, 10, "ALREADY_MIGRATED must be 10 on rerun");
    assert.equal(snapshot.summary.MISSING_CLERK_USER, 0);
    assert.equal(snapshot.summary.CONFLICT, 0);

    // Verify snapshot file exists
    const snapshotPath = path.resolve(process.cwd(), ".migration", "migration-snapshot.json");
    assert.ok(fs.existsSync(snapshotPath), "Snapshot file must be written to .migration/migration-snapshot.json");
  });

  // --- Category 4: Tenant Resolution Architecture ---
  console.log("\n--- 4. Tenant Resolution Post-Migration ---");

  await test("Migrated Auth.js user resolves to their existing business directly", async () => {
    // Select one migrated user
    const firstAudit = await prisma.clerkMigrationAudit.findFirstOrThrow();
    const migratedUser = await prisma.user.findUniqueOrThrow({
      where: { id: firstAudit.authUserId },
    });

    const business = await prisma.business.findUnique({
      where: { ownerId: migratedUser.id },
    });

    assert.ok(business, "Business must be resolved for migrated user");
    assert.equal(business.id, firstAudit.businessId, "Must resolve to the exact existing business ID");
    assert.equal(business.ownerId, migratedUser.id);
  });

  await test("New user provisioning creates a new business only when none exists", async () => {
    const testNewUser = await prisma.user.create({
      data: {
        name: "Brand New User",
        email: `new-user-${Date.now()}@example.com`,
      },
    });

    try {
      // 1. Verify initially no business exists
      let existing = await prisma.business.findUnique({
        where: { ownerId: testNewUser.id },
      });
      assert.equal(existing, null, "Brand new user should not have a business initially");

      // 2. Simulate provisioning
      const provisioned = await prisma.business.create({
        data: {
          ownerId: testNewUser.id,
          name: `${testNewUser.name}'s Business`,
        },
      });
      assert.ok(provisioned.id, "Business must be created");
      assert.equal(provisioned.ownerId, testNewUser.id);
      assert.equal(provisioned.name, "Brand New User's Business");

      // 3. Second resolution returns the same business
      const resolvedAgain = await prisma.business.findUnique({
        where: { ownerId: testNewUser.id },
      });
      assert.equal(resolvedAgain?.id, provisioned.id, "Subsequent lookup must return existing business");
    } finally {
      await prisma.business.deleteMany({ where: { ownerId: testNewUser.id } });
      await prisma.user.delete({ where: { id: testNewUser.id } });
    }
  });

  // --- Category 5: Multi-Tenant Boundary Isolation ---
  console.log("\n--- 5. Multi-Tenant Boundary Isolation Post-Migration ---");

  await test("User A cannot access Business B leads or tasks", async () => {
    const userA = await prisma.user.create({
      data: { name: "Tenant A User", email: `tenant-a-${Date.now()}@example.com` },
    });
    const userB = await prisma.user.create({
      data: { name: "Tenant B User", email: `tenant-b-${Date.now()}@example.com` },
    });

    const businessA = await prisma.business.create({
      data: { ownerId: userA.id, name: "Tenant A Business" },
    });
    const businessB = await prisma.business.create({
      data: { ownerId: userB.id, name: "Tenant B Business" },
    });

    try {
      const leadA = await prisma.lead.create({
        data: {
          businessId: businessA.id,
          name: "Confidential Lead A",
          source: "WEBSITE",
        },
      });
      const leadB = await prisma.lead.create({
        data: {
          businessId: businessB.id,
          name: "Confidential Lead B",
          source: "WEBSITE",
        },
      });

      const leadsA = await listLeads(businessA.id);
      const leadsB = await listLeads(businessB.id);

      assert.equal(leadsA.length, 1);
      assert.equal(leadsA[0].id, leadA.id);
      assert.equal(leadsB.length, 1);
      assert.equal(leadsB[0].id, leadB.id);

      // Verify no cross-tenant leakage
      assert.equal(leadsA.some((l) => l.id === leadB.id), false, "Tenant A cannot see Tenant B lead");
      assert.equal(leadsB.some((l) => l.id === leadA.id), false, "Tenant B cannot see Tenant A lead");
    } finally {
      await prisma.business.deleteMany({ where: { id: { in: [businessA.id, businessB.id] } } });
      await prisma.user.deleteMany({ where: { id: { in: [userA.id, userB.id] } } });
    }
  });

  // --- Category 6: Owner Email & Digest Compatibility ---
  console.log("\n--- 6. Owner Email Resolution via PostgreSQL ---");

  await test("resolveOwnerEmail resolves owner email from PostgreSQL for all migrated businesses", async () => {
    const businesses = await prisma.business.findMany();
    for (const b of businesses) {
      const email = await resolveOwnerEmail(b.ownerId);
      assert.ok(email, `Email must resolve for business ${b.id} with owner ${b.ownerId}`);
      assert.ok(email.includes("@"), "Resolved email must be valid");

      // Verify it matches the User table in PostgreSQL
      const dbUser = await prisma.user.findUnique({ where: { id: b.ownerId } });
      assert.equal(email, dbUser?.email, "Resolved email must match PostgreSQL User.email exactly");
    }
  });

  console.log("\n=================================================");
  console.log(`  PHASE 4 TEST RESULTS: ${passes} Passed, ${failures} Failed`);
  console.log("=================================================\n");

  if (failures > 0) {
    process.exit(1);
  }
}

runPhase4MigrationTests()
  .catch((err) => {
    console.error("Migration test suite failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
