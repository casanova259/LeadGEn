"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/src/server/services/auth.service";
import { updateBusiness } from "@/src/server/services/business.service";
import { prisma } from "@/lib/prisma";

export async function updateBusinessAction(data: {
  name?: string;
  industry?: string;
  timezone?: string;
}) {
  const user = await requireCurrentUser();

  // Verify that a business exists belonging to this owner
  const business = await prisma.business.findUnique({
    where: { ownerId: user.id },
  });
  if (!business) {
    throw new Error("Unauthorized: No business associated with this owner account");
  }

  await updateBusiness(user.id, data);
  revalidatePath("/settings");
}