"use server";

import { revalidatePath } from "next/cache";
import { TaskType } from "@prisma/client";
import { getOrCreateBusiness } from "@/src/server/services/business.service";
import {
  completeTask,
  createTask,
  rescheduleTask,
  deleteTask,
} from "@/src/server/services/task.service";

export async function completeTaskAction(id: string) {
  const business = await getOrCreateBusiness();
  const updated = await completeTask(id, business.id);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  if (updated.leadId) {
    revalidatePath(`/leads/${updated.leadId}`);
  }
}

export async function createTaskAction(data: {
  leadId: string;
  type: TaskType;
  dueAt: string;
}) {
  const business = await getOrCreateBusiness();
  const task = await createTask(business.id, {
    leadId: data.leadId,
    type: data.type,
    dueAt: new Date(data.dueAt),
  });
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath(`/leads/${data.leadId}`);
  return task;
}

export async function rescheduleTaskAction(id: string, dueAt: string) {
  const business = await getOrCreateBusiness();
  const task = await rescheduleTask(id, business.id, new Date(dueAt));
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  if (task.leadId) {
    revalidatePath(`/leads/${task.leadId}`);
  }
  return task;
}

export async function deleteTaskAction(id: string) {
  const business = await getOrCreateBusiness();
  const task = await deleteTask(id, business.id);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  if (task.leadId) {
    revalidatePath(`/leads/${task.leadId}`);
  }
}