"use server";

import { revalidatePath } from "next/cache";
import { getOrCreateBusiness } from "@/src/server/services/business.service";
import { completeTask } from "@/src/server/services/task.service";

export async function completeTaskAction(id: string) {
  const business = await getOrCreateBusiness();
  await completeTask(id, business.id);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}