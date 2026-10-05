import { requireCurrentUser } from "@/src/server/services/auth.service";
import { prisma } from "@/lib/prisma";

export async function getOrCreateBusiness(userId?: string, userName?: string | null) {
  let id = userId;
  let name = userName;

  if (!id) {
    const user = await requireCurrentUser();
    id = user.id;
    name = user.name;
  }

  // 1. Look up existing business for this authenticated user ID
  let business = await prisma.business.findUnique({
    where: { ownerId: id },
  });

  // 2. If no business exists yet for this user:
  // Provision a new business for genuine new signups
  if (!business) {
    business = await prisma.business.create({
      data: {
        ownerId: id,
        name: name ? `${name}'s Business` : "My Business",
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
