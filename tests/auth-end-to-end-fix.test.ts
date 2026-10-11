import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { registerUserAction } from "../src/server/actions/auth.actions";
import { getOrCreateBusiness } from "../src/server/services/business.service";
import { requireCurrentUser, resolveOwnerEmail } from "../src/server/services/auth.service";

async function runProductionAuthTestSuite() {
  console.log("=================================================");
  console.log("  LOST LEADS — PRODUCTION AUTHENTICATION SUITE    ");
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
  const testUserEmail = `reg-test-${timestamp}@example.com`;
  const testPassword = `SecurePass_${timestamp}!123`;
  let registeredUserId = "";

  // --------------------------------------------------------------------------
  // 1. REGISTRATION VERIFICATION
  // --------------------------------------------------------------------------
  console.log("--- 1. Real User Registration & Validation ---");

  await test("Rejects invalid inputs: short name, invalid email, short password, mismatch", async () => {
    // Short name
    const res1 = await registerUserAction({
      name: "A",
      email: testUserEmail,
      password: testPassword,
      confirmPassword: testPassword,
    });
    assert.equal(res1.success, false);
    assert.ok(res1.fieldErrors?.name);

    // Invalid email format
    const res2 = await registerUserAction({
      name: "Alex Johnson",
      email: "invalid-email-string",
      password: testPassword,
      confirmPassword: testPassword,
    });
    assert.equal(res2.success, false);
    assert.ok(res2.fieldErrors?.email);

    // Short password (< 8 chars)
    const res3 = await registerUserAction({
      name: "Alex Johnson",
      email: testUserEmail,
      password: "short",
      confirmPassword: "short",
    });
    assert.equal(res3.success, false);
    assert.ok(res3.fieldErrors?.password);

    // Password mismatch
    const res4 = await registerUserAction({
      name: "Alex Johnson",
      email: testUserEmail,
      password: testPassword,
      confirmPassword: "DifferentPassword123!",
    });
    assert.equal(res4.success, false);
    assert.ok(res4.fieldErrors?.confirmPassword);
  });

  await test("Valid registration atomically creates User and dedicated Business", async () => {
    const res = await registerUserAction({
      name: "Alex Johnson",
      email: testUserEmail,
      password: testPassword,
      confirmPassword: testPassword,
    });
    assert.equal(res.success, true, "Registration must succeed for valid input");

    // Verify user in PostgreSQL
    const user = (await prisma.user.findUnique({
      where: { email: testUserEmail },
    })) as { id: string; name: string | null; email: string | null; password?: string | null } | null;
    assert.ok(user, "User must exist in database");
    assert.equal(user.name, "Alex Johnson");
    registeredUserId = user.id;

    // Verify password is NOT stored in plaintext
    assert.notEqual(user.password, testPassword, "Password must not be stored in plaintext");
    assert.ok(user.password?.startsWith("$2"), "Password must be a valid bcrypt hash");

    // Verify bcrypt comparison succeeds with correct password
    const isMatch = await bcrypt.compare(testPassword, user.password!);
    assert.equal(isMatch, true, "Bcrypt hash must match registration password");

    // Verify dedicated business was created in the same atomic transaction
    const business = await prisma.business.findUnique({
      where: { ownerId: user.id },
    });
    assert.ok(business, "Business must be created for newly registered user");
    assert.equal(business.ownerId, user.id, "Business.ownerId must match User.id");
    assert.equal(business.name, "Alex Johnson's Business");
  });

  await test("Duplicate email registration is rejected safely without duplicates", async () => {
    const res = await registerUserAction({
      name: "Alex Duplicate",
      email: testUserEmail.toUpperCase(), // Test case normalization
      password: testPassword,
      confirmPassword: testPassword,
    });
    assert.equal(res.success, false, "Must reject duplicate email registration");
    assert.ok(
      res.error?.includes("already exists"),
      "Error message must inform user that account already exists"
    );

    // Verify exactly 1 user exists with this email
    const count = await prisma.user.count({
      where: { email: testUserEmail },
    });
    assert.equal(count, 1, "Only 1 user record must exist in PostgreSQL");
  });

  // --------------------------------------------------------------------------
  // 2. CREDENTIALS VERIFICATION & AUTH.JS PROVIDER
  // --------------------------------------------------------------------------
  console.log("\n--- 2. Credentials Verification Logic ---");

  await test("Credentials authorization accepts valid email/password and returns user", async () => {
    // Query User and verify credentials exactly as Auth.js Credentials Provider does
    const email = testUserEmail.trim().toLowerCase();
    const user = (await prisma.user.findUnique({ where: { email } })) as { password?: string | null } | null;
    assert.ok(user && user.password);

    const valid = await bcrypt.compare(testPassword, user.password);
    assert.equal(valid, true, "Bcrypt verification must succeed for correct password");
  });

  await test("Credentials authorization rejects incorrect password", async () => {
    const email = testUserEmail.trim().toLowerCase();
    const user = (await prisma.user.findUnique({ where: { email } })) as { password?: string | null } | null;
    assert.ok(user && user.password);

    const valid = await bcrypt.compare("WrongPassword123!", user.password);
    assert.equal(valid, false, "Bcrypt verification must reject wrong password");
  });

  await test("Non-existent user lookup safely returns null without exceptions", async () => {
    const email = `unknown-user-${Date.now()}@example.com`;
    const user = await prisma.user.findUnique({ where: { email } });
    assert.equal(user, null, "Unknown user must return null");
  });

  // --------------------------------------------------------------------------
  // 3. MULTI-TENANT ISOLATION & DATA PERMISSION BOUNDARIES
  // --------------------------------------------------------------------------
  console.log("\n--- 3. Multi-Tenant Business & Resource Isolation ---");

  let tenantB_UserId = "";
  const tenantB_Email = `tenant-b-${timestamp}@example.com`;

  await test("Second tenant registration creates isolated tenant boundary", async () => {
    const res = await registerUserAction({
      name: "Tenant B Owner",
      email: tenantB_Email,
      password: testPassword,
      confirmPassword: testPassword,
    });
    assert.equal(res.success, true);

    const userB = await prisma.user.findUnique({ where: { email: tenantB_Email } });
    assert.ok(userB);
    tenantB_UserId = userB.id;

    const bizB = await prisma.business.findUnique({ where: { ownerId: userB.id } });
    assert.ok(bizB);

    const bizA = await prisma.business.findUnique({ where: { ownerId: registeredUserId } });
    assert.ok(bizA);

    assert.notEqual(bizA.id, bizB.id, "Tenant A and Tenant B must have distinct businesses");
  });

  await test("Leads created under Tenant A are strictly invisible to Tenant B", async () => {
    const bizA = await prisma.business.findUnique({ where: { ownerId: registeredUserId } });
    const bizB = await prisma.business.findUnique({ where: { ownerId: tenantB_UserId } });
    assert.ok(bizA && bizB);

    // Create a lead in Tenant A
    const leadA = await prisma.lead.create({
      data: {
        businessId: bizA.id,
        name: "Confidential Lead A",
        email: "leadA@example.com",
        source: "WEBSITE",
      },
    });

    // Query leads for Tenant B
    const tenantBLeads = await prisma.lead.findMany({
      where: { businessId: bizB.id },
    });
    const foundInB = tenantBLeads.some((l) => l.id === leadA.id);
    assert.equal(foundInB, false, "Tenant A's lead must NOT appear in Tenant B queries");

    // Clean up test lead
    await prisma.lead.delete({ where: { id: leadA.id } });
  });

  // --------------------------------------------------------------------------
  // 4. CLEANUP OF TEST FIXTURES
  // --------------------------------------------------------------------------
  console.log("\n--- 4. Cleanup of Test Fixtures ---");

  await test("Safely clean up test users and businesses without touching production tenants", async () => {
    // Clean up Tenant A
    await prisma.business.deleteMany({ where: { ownerId: registeredUserId } });
    await prisma.user.deleteMany({ where: { id: registeredUserId } });

    // Clean up Tenant B
    await prisma.business.deleteMany({ where: { ownerId: tenantB_UserId } });
    await prisma.user.deleteMany({ where: { id: tenantB_UserId } });

    const checkA = await prisma.user.findUnique({ where: { id: registeredUserId } });
    const checkB = await prisma.user.findUnique({ where: { id: tenantB_UserId } });
    assert.equal(checkA, null);
    assert.equal(checkB, null);
  });

  // --------------------------------------------------------------------------
  // 5. PRODUCTION INTEGRITY INVARIANTS
  // --------------------------------------------------------------------------
  console.log("\n--- 5. Production Database Invariants ---");

  await test("All production businesses reference valid Auth.js users with zero Clerk IDs", async () => {
    const businesses = await prisma.business.findMany();
    assert.ok(businesses.length > 0, "Businesses must exist");

    for (const b of businesses) {
      assert.ok(!b.ownerId.startsWith("user_"), `Business ${b.id} ownerId ${b.ownerId} must not be a Clerk ID`);
      const owner = await prisma.user.findUnique({ where: { id: b.ownerId } });
      assert.ok(owner, `Business ${b.id} owner ${b.ownerId} must resolve to a valid User`);
    }
  });

  console.log("\n=================================================");
  console.log(`  AUTH PRODUCTION RESULTS: ${passes} Passed, ${failures} Failed`);
  console.log("=================================================\n");

  if (failures > 0) {
    process.exit(1);
  }
}

runProductionAuthTestSuite().catch((e) => {
  console.error(e);
  process.exit(1);
});
