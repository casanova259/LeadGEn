-- CreateTable
CREATE TABLE "clerk_migration_audits" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "authUserId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "sourceEmail" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "migratedAt" TIMESTAMP(3),

    CONSTRAINT "clerk_migration_audits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clerk_migration_audits_clerkUserId_key" ON "clerk_migration_audits"("clerkUserId");

-- CreateIndex
CREATE UNIQUE INDEX "clerk_migration_audits_authUserId_key" ON "clerk_migration_audits"("authUserId");

-- CreateIndex
CREATE UNIQUE INDEX "clerk_migration_audits_businessId_key" ON "clerk_migration_audits"("businessId");
