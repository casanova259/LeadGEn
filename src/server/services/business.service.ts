import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function getOrCreateBusiness() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const business = await prisma.business.upsert({
    where: { ownerId: userId },
    update: {},
    create: {
      ownerId: userId,
      name: "My Business",
    },
  });

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
