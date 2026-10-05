import { prisma } from "../lib/prisma";
import * as fs from "node:fs";
import * as path from "node:path";

export type MigrationStatus =
  | "READY"
  | "ALREADY_MIGRATED"
  | "MISSING_CLERK_USER"
  | "MISSING_EMAIL"
  | "DUPLICATE_EMAIL"
  | "MISSING_AUTH_USER"
  | "AMBIGUOUS_MAPPING"
  | "CONFLICT"
  | "SKIPPED";

export interface MigrationPlanItem {
  businessId: string;
  businessName: string;
  currentOwnerId: string;
  clerkUserId: string | null;
  clerkEmail: string | null;
  clerkName: string | null;
  clerkVerified: boolean;
  clerkImageUrl: string | null;
  targetAuthUserId: string | null;
  status: MigrationStatus;
  reason?: string;
}

export interface MigrationSnapshot {
  timestamp: string;
  mode: "dry-run" | "apply" | "rollback";
  baseline: {
    businesses: number;
    leads: number;
    tasks: number;
    activities: number;
    users: number;
  };
  summary: Record<MigrationStatus, number>;
  items: MigrationPlanItem[];
}

const SNAPSHOT_DIR = path.resolve(process.cwd(), ".migration");
const SNAPSHOT_FILE = path.join(SNAPSHOT_DIR, "migration-snapshot.json");

export async function runMigration(mode: "dry-run" | "apply" | "rollback" = "dry-run") {
  console.log("=================================================================");
  console.log(`  CLERK → AUTH.JS USER & TENANT MIGRATION (Mode: ${mode.toUpperCase()})`);
  console.log("=================================================================\n");

  // 1. Gather baseline data
  const businesses = await prisma.business.findMany({
    orderBy: { createdAt: "asc" },
  });
  const leadsCount = await prisma.lead.count();
  const tasksCount = await prisma.task.count();
  const activitiesCount = await prisma.activity.count();
  const existingUsers = await prisma.user.findMany();
  const existingAudits = await prisma.clerkMigrationAudit.findMany();

  const baseline = {
    businesses: businesses.length,
    leads: leadsCount,
    tasks: tasksCount,
    activities: activitiesCount,
    users: existingUsers.length,
  };

  console.log(`[Baseline Snapshot]`);
  console.log(`  Businesses:  ${baseline.businesses}`);
  console.log(`  Leads:       ${baseline.leads}`);
  console.log(`  Tasks:       ${baseline.tasks}`);
  console.log(`  Activities:  ${baseline.activities}`);
  console.log(`  Users:       ${baseline.users}`);
  console.log(`  Audit Logs:  ${existingAudits.length}\n`);

  if (mode === "rollback") {
    return await executeRollback(businesses, existingAudits, baseline);
  }

  // 2. Fetch Clerk users from Clerk API (if available) or snapshot
  console.log("[1/4] Loading Clerk user identity mapping...");
  let clerkUsers: any[] = [];
  try {
    // @ts-ignore
    const clerkModule = await import("@clerk/nextjs/server").catch(() => null);
    if (clerkModule?.clerkClient) {
      const client = await clerkModule.clerkClient();
      const res = await client.users.getUserList({ limit: 500 });
      clerkUsers = res.data;
    }
  } catch {
    // Clerk SDK uninstalled in Phase 5
  }

  // Fallback to migration snapshot if Clerk SDK is uninstalled
  if (clerkUsers.length === 0 && fs.existsSync(SNAPSHOT_FILE)) {
    try {
      const savedSnapshot = JSON.parse(fs.readFileSync(SNAPSHOT_FILE, "utf-8"));
      clerkUsers = (savedSnapshot.items || []).map((item: any) => ({
        id: item.clerkUserId,
        firstName: item.clerkName?.split(" ")[0] || "",
        lastName: item.clerkName?.split(" ").slice(1).join(" ") || "",
        imageUrl: item.clerkImageUrl,
        primaryEmailAddressId: "primary",
        emailAddresses: [
          {
            id: "primary",
            emailAddress: item.clerkEmail,
            verification: { status: item.clerkVerified ? "verified" : "unverified" },
          },
        ],
      }));
      console.log(`  Loaded ${clerkUsers.length} Clerk user identities from snapshot.`);
    } catch (e) {
      console.error("Failed to load snapshot fallback:", e);
    }
  } else {
    console.log(`  Discovered ${clerkUsers.length} Clerk users in instance.\n`);
  }

  // Build Clerk user index by ID and email
  const clerkById = new Map<string, (typeof clerkUsers)[0]>();
  const clerkUsersByEmail = new Map<string, (typeof clerkUsers)[0][]>();

  for (const cu of clerkUsers) {
    clerkById.set(cu.id, cu);
    for (const em of cu.emailAddresses) {
      const normalized = em.emailAddress.trim().toLowerCase();
      const list = clerkUsersByEmail.get(normalized) ?? [];
      list.push(cu);
      clerkUsersByEmail.set(normalized, list);
    }
  }

  // Build Auth.js user index by ID and email
  const authUserById = new Map<string, (typeof existingUsers)[0]>();
  const authUserByEmail = new Map<string, (typeof existingUsers)[0]>();
  for (const u of existingUsers) {
    authUserById.set(u.id, u);
    if (u.email) {
      authUserByEmail.set(u.email.trim().toLowerCase(), u);
    }
  }

  const auditsByBusinessId = new Map<string, (typeof existingAudits)[0]>();
  for (const a of existingAudits) {
    auditsByBusinessId.set(a.businessId, a);
  }

  // 3. Plan and classify each Business
  console.log("[2/4] Evaluating and classifying Business ownership mappings...");
  const planItems: MigrationPlanItem[] = [];
  const statusCounts: Record<MigrationStatus, number> = {
    READY: 0,
    ALREADY_MIGRATED: 0,
    MISSING_CLERK_USER: 0,
    MISSING_EMAIL: 0,
    DUPLICATE_EMAIL: 0,
    MISSING_AUTH_USER: 0,
    AMBIGUOUS_MAPPING: 0,
    CONFLICT: 0,
    SKIPPED: 0,
  };

  for (const biz of businesses) {
    const audit = auditsByBusinessId.get(biz.id);
    const isOwnerAuthUser = authUserById.has(biz.ownerId);

    // Case A: Already migrated
    if (audit?.status === "MIGRATED" && isOwnerAuthUser) {
      const targetUser = authUserById.get(biz.ownerId)!;
      planItems.push({
        businessId: biz.id,
        businessName: biz.name,
        currentOwnerId: biz.ownerId,
        clerkUserId: audit.clerkUserId,
        clerkEmail: audit.sourceEmail,
        clerkName: targetUser.name,
        clerkVerified: !!targetUser.emailVerified,
        clerkImageUrl: targetUser.image,
        targetAuthUserId: targetUser.id,
        status: "ALREADY_MIGRATED",
        reason: "Business already mapped to Auth.js user in audit log",
      });
      statusCounts.ALREADY_MIGRATED++;
      continue;
    }

    // Case B: Business ownerId is a Clerk user ID
    const clerkUser = clerkById.get(biz.ownerId);
    if (!clerkUser) {
      // Check if maybe it's an Auth.js user created manually
      if (isOwnerAuthUser) {
        planItems.push({
          businessId: biz.id,
          businessName: biz.name,
          currentOwnerId: biz.ownerId,
          clerkUserId: null,
          clerkEmail: authUserById.get(biz.ownerId)?.email ?? null,
          clerkName: authUserById.get(biz.ownerId)?.name ?? null,
          clerkVerified: !!authUserById.get(biz.ownerId)?.emailVerified,
          clerkImageUrl: authUserById.get(biz.ownerId)?.image ?? null,
          targetAuthUserId: biz.ownerId,
          status: "ALREADY_MIGRATED",
          reason: "OwnerId matches Auth.js user directly without audit record",
        });
        statusCounts.ALREADY_MIGRATED++;
        continue;
      }

      planItems.push({
        businessId: biz.id,
        businessName: biz.name,
        currentOwnerId: biz.ownerId,
        clerkUserId: null,
        clerkEmail: null,
        clerkName: null,
        clerkVerified: false,
        clerkImageUrl: null,
        targetAuthUserId: null,
        status: "MISSING_CLERK_USER",
        reason: `Owner ID ${biz.ownerId} not found in Clerk instance`,
      });
      statusCounts.MISSING_CLERK_USER++;
      continue;
    }

    // Find primary email
    const primaryEmailObj = clerkUser.emailAddresses.find(
      (e: any) => e.id === clerkUser.primaryEmailAddressId
    ) ?? clerkUser.emailAddresses[0];

    if (!primaryEmailObj?.emailAddress) {
      planItems.push({
        businessId: biz.id,
        businessName: biz.name,
        currentOwnerId: biz.ownerId,
        clerkUserId: clerkUser.id,
        clerkEmail: null,
        clerkName: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim(),
        clerkVerified: false,
        clerkImageUrl: clerkUser.imageUrl ?? null,
        targetAuthUserId: null,
        status: "MISSING_EMAIL",
        reason: "Clerk user has no primary email address",
      });
      statusCounts.MISSING_EMAIL++;
      continue;
    }

    const normalizedEmail = primaryEmailObj.emailAddress.trim().toLowerCase();
    const isVerified = primaryEmailObj.verification?.status === "verified";
    const fullName = `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || null;

    // Check for duplicate emails in Clerk
    const clerkDuplicates = clerkUsersByEmail.get(normalizedEmail) ?? [];
    if (clerkDuplicates.length > 1) {
      planItems.push({
        businessId: biz.id,
        businessName: biz.name,
        currentOwnerId: biz.ownerId,
        clerkUserId: clerkUser.id,
        clerkEmail: normalizedEmail,
        clerkName: fullName,
        clerkVerified: isVerified,
        clerkImageUrl: clerkUser.imageUrl ?? null,
        targetAuthUserId: null,
        status: "DUPLICATE_EMAIL",
        reason: `Multiple Clerk accounts share email ${normalizedEmail}`,
      });
      statusCounts.DUPLICATE_EMAIL++;
      continue;
    }

    // Check target Auth.js user
    const existingAuthUser = authUserByEmail.get(normalizedEmail);
    const targetAuthUserId = existingAuthUser?.id ?? null;

    planItems.push({
      businessId: biz.id,
      businessName: biz.name,
      currentOwnerId: biz.ownerId,
      clerkUserId: clerkUser.id,
      clerkEmail: normalizedEmail,
      clerkName: fullName,
      clerkVerified: isVerified,
      clerkImageUrl: clerkUser.imageUrl ?? null,
      targetAuthUserId,
      status: "READY",
      reason: existingAuthUser
        ? "Existing Auth.js user found with identical email"
        : "New Auth.js user will be provisioned in transaction",
    });
    statusCounts.READY++;
  }

  // 4. Print Summary Table
  console.log("------------------------------------------------------------------------------------------------------------------");
  console.log(
    "Business ID".padEnd(28) +
      "Business Name".padEnd(16) +
      "Clerk Owner ID".padEnd(32) +
      "Email".padEnd(30) +
      "Status"
  );
  console.log("------------------------------------------------------------------------------------------------------------------");
  for (const item of planItems) {
    console.log(
      item.businessId.padEnd(28) +
        item.businessName.slice(0, 14).padEnd(16) +
        item.currentOwnerId.slice(0, 30).padEnd(32) +
        (item.clerkEmail ?? "N/A").slice(0, 28).padEnd(30) +
        item.status
    );
  }
  console.log("------------------------------------------------------------------------------------------------------------------\n");

  console.log(`[Status Breakdown]`);
  console.log(`  READY:               ${statusCounts.READY}`);
  console.log(`  ALREADY_MIGRATED:    ${statusCounts.ALREADY_MIGRATED}`);
  console.log(`  MISSING_CLERK_USER:  ${statusCounts.MISSING_CLERK_USER}`);
  console.log(`  MISSING_EMAIL:       ${statusCounts.MISSING_EMAIL}`);
  console.log(`  DUPLICATE_EMAIL:     ${statusCounts.DUPLICATE_EMAIL}`);
  console.log(`  AMBIGUOUS_MAPPING:   ${statusCounts.AMBIGUOUS_MAPPING}`);
  console.log(`  CONFLICT:            ${statusCounts.CONFLICT}`);
  console.log(`  SKIPPED:             ${statusCounts.SKIPPED}\n`);

  // Save snapshot artifact
  if (!fs.existsSync(SNAPSHOT_DIR)) {
    fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
  }
  const snapshot: MigrationSnapshot = {
    timestamp: new Date().toISOString(),
    mode,
    baseline,
    summary: statusCounts,
    items: planItems,
  };
  fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(snapshot, null, 2), "utf-8");
  console.log(`  [Snapshot] Migration plan snapshot written to ${SNAPSHOT_FILE}\n`);

  const hasErrors =
    statusCounts.MISSING_CLERK_USER > 0 ||
    statusCounts.MISSING_EMAIL > 0 ||
    statusCounts.DUPLICATE_EMAIL > 0 ||
    statusCounts.AMBIGUOUS_MAPPING > 0 ||
    statusCounts.CONFLICT > 0;

  if (hasErrors) {
    console.error("  ✖ CRITICAL: Migration plan contains unresolved conflicts or missing data.");
    console.error("    Execution halted. All records must be RESOLVED before apply can run.");
    if (mode === "apply") {
      throw new Error("Cannot apply migration with unresolved conflicts.");
    }
    return snapshot;
  }

  if (mode === "dry-run") {
    console.log("  ✔ DRY-RUN SUCCESSFUL: 0 conflicts detected.");
    console.log(`    ${statusCounts.READY} businesses ready for ownership migration.`);
    console.log("    No database modifications were made.");
    console.log("    To apply changes, run: npm run migrate:clerk-to-authjs:apply\n");
    return snapshot;
  }

  // Mode: apply
  if (statusCounts.READY === 0) {
    console.log("  ✔ All businesses are already migrated! Nothing to apply.\n");
    return snapshot;
  }

  console.log(`[3/4] Applying migration for ${statusCounts.READY} businesses in a database transaction...`);

  await prisma.$transaction(
    async (tx) => {
      for (const item of planItems) {
        if (item.status !== "READY") continue;

        // 1. Ensure Auth.js User exists
        let authUser = await tx.user.findUnique({
          where: { email: item.clerkEmail! },
        });

        if (!authUser) {
          authUser = await tx.user.create({
            data: {
              email: item.clerkEmail!,
              name: item.clerkName,
              emailVerified: item.clerkVerified ? new Date() : null,
              image: item.clerkImageUrl,
            },
          });
          console.log(`    + Created Auth.js User: ${authUser.id} (${authUser.email})`);
        } else {
          console.log(`    = Found existing Auth.js User: ${authUser.id} (${authUser.email})`);
        }

        // 2. Update Business.ownerId
        await tx.business.update({
          where: { id: item.businessId },
          data: { ownerId: authUser.id },
        });
        console.log(`    ✔ Updated Business ${item.businessId} ownerId: ${item.currentOwnerId} → ${authUser.id}`);

        // 3. Upsert audit record
        await tx.clerkMigrationAudit.upsert({
          where: { businessId: item.businessId },
          create: {
            clerkUserId: item.clerkUserId!,
            authUserId: authUser.id,
            businessId: item.businessId,
            sourceEmail: item.clerkEmail!,
            status: "MIGRATED",
            migratedAt: new Date(),
          },
          update: {
            authUserId: authUser.id,
            sourceEmail: item.clerkEmail!,
            status: "MIGRATED",
            migratedAt: new Date(),
          },
        });
      }
    },
    { timeout: 30000 }
  );

  // 4. Post-migration reconciliation
  console.log("\n[4/4] Running post-migration integrity reconciliation...");
  const postBusinesses = await prisma.business.findMany();
  const postLeads = await prisma.lead.count();
  const postTasks = await prisma.task.count();
  const postActivities = await prisma.activity.count();
  const postUsers = await prisma.user.findMany();
  const postAudits = await prisma.clerkMigrationAudit.findMany();

  console.log(`  Post-apply Business count:  ${postBusinesses.length} (Expected: ${baseline.businesses})`);
  console.log(`  Post-apply Lead count:      ${postLeads} (Expected: ${baseline.leads})`);
  console.log(`  Post-apply Task count:      ${postTasks} (Expected: ${baseline.tasks})`);
  console.log(`  Post-apply Activity count:  ${postActivities} (Expected: ${baseline.activities})`);
  console.log(`  Post-apply Auth.js Users:   ${postUsers.length}`);
  console.log(`  Post-apply Audit records:   ${postAudits.length}\n`);

  if (
    postBusinesses.length !== baseline.businesses ||
    postLeads !== baseline.leads ||
    postTasks !== baseline.tasks ||
    postActivities !== baseline.activities
  ) {
    throw new Error("Data count mismatch detected post-migration! Reconciliation failed!");
  }

  // Confirm every Business now points to a valid Auth.js User
  const userMap = new Set(postUsers.map((u) => u.id));
  const invalidOwners = postBusinesses.filter((b) => !userMap.has(b.ownerId));
  if (invalidOwners.length > 0) {
    throw new Error(
      `Found ${invalidOwners.length} businesses with ownerId not matching any Auth.js User: ${JSON.stringify(invalidOwners)}`
    );
  }

  console.log("  ✔ RECONCILIATION SUCCESSFUL: 100% of Businesses map to valid Auth.js Users.");
  console.log("  ✔ Zero data loss: All Leads, Tasks, and Activities preserved intact.\n");

  return snapshot;
}

async function executeRollback(
  businesses: { id: string; ownerId: string; name: string }[],
  audits: { id: string; clerkUserId: string; authUserId: string; businessId: string; status: string }[],
  baseline: { businesses: number; leads: number; tasks: number; activities: number; users: number }
): Promise<MigrationSnapshot> {
  console.log("[Rollback Mode] Reverting Business.ownerId to original Clerk User IDs...");

  if (audits.length === 0) {
    console.log("  No migration audit records found to roll back.");
  } else {
    await prisma.$transaction(
      async (tx) => {
        for (const audit of audits) {
          if (audit.status !== "MIGRATED") continue;

          await tx.business.update({
            where: { id: audit.businessId },
            data: { ownerId: audit.clerkUserId },
          });

          await tx.clerkMigrationAudit.update({
            where: { id: audit.id },
            data: { status: "ROLLED_BACK" },
          });

          console.log(`    ↺ Restored Business ${audit.businessId} ownerId → ${audit.clerkUserId}`);
        }
      },
      { timeout: 30000 }
    );
  }

  console.log("\n  ✔ Rollback completed successfully.");
  const postBusinesses = await prisma.business.findMany();
  console.log(`  Restored ${postBusinesses.length} businesses.`);

  return {
    timestamp: new Date().toISOString(),
    mode: "rollback",
    baseline,
    summary: {
      READY: 0,
      ALREADY_MIGRATED: 0,
      MISSING_CLERK_USER: 0,
      MISSING_EMAIL: 0,
      DUPLICATE_EMAIL: 0,
      MISSING_AUTH_USER: 0,
      AMBIGUOUS_MAPPING: 0,
      CONFLICT: 0,
      SKIPPED: 0,
    },
    items: [],
  };
}

// CLI entrypoint
const isDirectExecution =
  process.argv[1]?.replace(/\\/g, "/").endsWith("scripts/migrate-clerk-to-authjs.ts") ||
  process.argv[1]?.replace(/\\/g, "/").endsWith("scripts/migrate-clerk-to-authjs");

if (isDirectExecution) {
  const args = process.argv.slice(2);
  const mode: "dry-run" | "apply" | "rollback" = args.includes("--apply")
    ? "apply"
    : args.includes("--rollback")
    ? "rollback"
    : "dry-run";

  runMigration(mode)
    .then(() => {
      console.log("=================================================================");
      console.log("  MIGRATION SCRIPT FINISHED CLEANLY");
      console.log("=================================================================\n");
      process.exit(0);
    })
    .catch((err) => {
      console.error("\n❌ MIGRATION FAILED:");
      console.error(err);
      process.exit(1);
    });
}
