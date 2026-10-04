import { requireCurrentUser } from "@/src/server/services/auth.service";
import { prisma } from "@/lib/prisma";

export async function getOrCreateBusiness() {
  const user = await requireCurrentUser();

  // 1. Look up existing business for this authenticated user ID
  let business = await prisma.business.findUnique({
    where: { ownerId: user.id },
  });

  // 2. If no business exists yet for this user:
  // Provision a new business for genuine new signups
  if (!business) {
    business = await prisma.business.create({
      data: {
        ownerId: user.id,
        name: user.name ? `${user.name}'s Business` : "My Business",
      },
    });
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
