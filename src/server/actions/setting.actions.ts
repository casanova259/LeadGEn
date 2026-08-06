"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { updateBusiness } from "@/src/server/services/business.service";

export async function updateBusinessAction(data: {
  name?: string;
  industry?: string;
  timezone?: string;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await updateBusiness(userId, data);
  revalidatePath("/settings");
}