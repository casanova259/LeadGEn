import { requireCurrentUser, TenantNotProvisionedError } from "@/src/server/services/auth.service";
import { prisma } from "@/lib/prisma";

export async function getOrCreateBusiness() {
  const user = await requireCurrentUser();

  // 1. Clerk Identity (current production path):
  // Upserts "My Business" for the Clerk user ID. Preserves 100% backward compatibility.
  if (user.provider === "clerk") {
    const business = await prisma.business.upsert({
      where: { ownerId: user.id },
      update: {},
      create: {
        ownerId: user.id,
        name: "My Business",
      },
    });
    return business;
  }

  // 2. Auth.js Identity:
  // Explicitly looks up business where ownerId = user.id.
  // CRITICAL (Phase 3 Rule): Do NOT auto-provision into existing businesses or guess by email.
  const business = await prisma.business.findUnique({
    where: { ownerId: user.id },
  });

  if (!business) {
    throw new TenantNotProvisionedError(
      "No business tenant associated with this Auth.js account. Production tenant mapping occurs in Phase 4."
    );
  }

  return business;
}

export async function updateBusiness(
  ownerId: string,
  data: { name?: string; industry?: string; timezone?: string }
) {
  return prisma.business.update({
    where: { ownerId },
    data,
  });
}
