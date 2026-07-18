import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/src/lib/prisma";

export async function getOrCreateBusiness() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  let business = await prisma.business.findUnique({
    where: { ownerId: userId },
  });

  if (!business) {
    business = await prisma.business.create({
      data: {
        ownerId: userId,
        name: "My Business",
      },
    });
  }

  return business;
}