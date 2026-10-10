import assert from "node:assert/strict";
import { prisma } from "../lib/prisma";
import { directSignInAction } from "../src/server/actions/dev-auth.actions";
import { getCurrentUser, requireCurrentUser, resolveOwnerEmail } from "../src/server/services/auth.service";
import { getOrCreateBusiness } from "../src/server/services/business.service";

async function runEndToEndFixTests() {
  console.log("=================================================");
  console.log("  AUTH END-TO-END VERIFICATION & ROOT-CAUSE SUITE ");
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

  // 1. Verify directSignInAction returns result object without throwing NEXT_REDIRECT
  console.log("--- 1. Direct Sign-In Action Contract & Behavior ---");
  const testEmail = `e2e-test-${Date.now()}@example.com`;
  let testUserId = "";

  await test("directSignInAction succeeds and returns success result object", async () => {
    const res = await directSignInAction(testEmail, "/dashboard");
    assert.equal(res.success, true, "Must return success: true");
    assert.equal(res.redirectUrl, "/dashboard", "Must return target redirect URL");

    // Verify user was created in Prisma and marked emailVerified
    const user = await prisma.user.findUnique({
      where: { email: testEmail },
    });
    assert.ok(user, "User must exist in Prisma");
    assert.ok(user.emailVerified, "User must have emailVerified timestamp set");
    testUserId = user.id;

    // Verify session was created for this user
    const session = await prisma.session.findFirst({
      where: { userId: user.id },
    });
    assert.ok(session, "Session must exist in Prisma");
    assert.ok(session.expires > new Date(), "Session must not be expired");
  });

  // 2. Business Tenancy Resolution
  console.log("\n--- 2. Multi-Tenant Business Resolution ---");
  await test("Newly created user gets a dedicated business with User.id as ownerId", async () => {
    const biz = await getOrCreateBusiness(testUserId, "E2E Test User");
    assert.ok(biz, "Business must be created");
    assert.equal(biz.ownerId, testUserId, "Business.ownerId must match User.id");
    assert.ok(!biz.ownerId.startsWith("user_"), "ownerId must not be a Clerk ID");
  });

  // 3. Clean-up test records
  console.log("\n--- 3. Clean-up & Isolation ---");
  await test("Clean up E2E test user and business without touching production tenants", async () => {
    await prisma.business.deleteMany({ where: { ownerId: testUserId } });
    await prisma.session.deleteMany({ where: { userId: testUserId } });
    await prisma.user.deleteMany({ where: { id: testUserId } });

    const check = await prisma.user.findUnique({ where: { id: testUserId } });
    assert.equal(check, null, "Test user must be cleaned up");
  });

  // 4. Database Integrity Check
  console.log("\n--- 4. Production Database Invariants ---");
  await test("All businesses reference valid Auth.js users with zero Clerk IDs", async () => {
    const businesses = await prisma.business.findMany();
    assert.ok(businesses.length > 0, "Businesses must exist");

    for (const b of businesses) {
      assert.ok(!b.ownerId.startsWith("user_"), `Business ${b.id} ownerId ${b.ownerId} must not be a Clerk ID`);
      const owner = await prisma.user.findUnique({ where: { id: b.ownerId } });
      assert.ok(owner, `Business ${b.id} owner ${b.ownerId} must resolve to a valid User`);
    }
  });

  console.log("\n=================================================");
  console.log(`  E2E TEST RESULTS: ${passes} Passed, ${failures} Failed`);
  console.log("=================================================\n");

  if (failures > 0) {
    process.exit(1);
  }
}

runEndToEndFixTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
