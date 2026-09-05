"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getOrCreateBusiness } from "@/src/server/services/business.service";
import {
  createLead,
  updateLead,
  deleteLead,
  CreateLeadInput,
  UpdateLeadInput,
} from "@/src/server/services/lead.service";

export async function createLeadAction(input: Omit<CreateLeadInput, "businessId">) {
  const business = await getOrCreateBusiness();
  await createLead({ ...input, businessId: business.id });
  revalidatePath("/leads");
  redirect("/leads");
}

export async function updateLeadAction(id: string, input: UpdateLeadInput) {
  const business = await getOrCreateBusiness();
  await updateLead(id, business.id, input);
  revalidatePath("/leads");
  revalidatePath(`/leads/${id}`);
  revalidatePath("/dashboard");
}

export async function markContactedAction(id: string) {
  const business = await getOrCreateBusiness();
  await updateLead(id, business.id, {
    status: "CONTACTED",
    contactedAt: new Date(),
  });
  revalidatePath("/leads");
  revalidatePath(`/leads/${id}`);
  revalidatePath("/dashboard");
}

export async function deleteLeadAction(id: string) {
  const business = await getOrCreateBusiness();
  await deleteLead(id, business.id);
  revalidatePath("/leads");
  revalidatePath("/dashboard");
  redirect("/leads");
}

export async function addLeadNoteAction(
  leadId: string,
  input: {
    note: string;
    category: "CALL" | "VOICEMAIL" | "MEETING" | "GENERAL";
    scheduleFollowUp?: boolean;
    followUpDueAt?: string;
  }
) {
  const business = await getOrCreateBusiness();
  const res = await (await import("@/src/server/services/lead.service")).addLeadNote(
    leadId,
    business.id,
    {
      note: input.note,
      category: input.category,
      scheduleFollowUp: input.scheduleFollowUp,
      followUpDueAt: input.followUpDueAt ? new Date(input.followUpDueAt) : undefined,
    }
  );

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return res;
}

export async function importLeadsAction(
  leads: Array<{
    name: string;
    phone?: string;
    email?: string;
    source?: any;
    priority?: any;
    notes?: string;
  }>,
  autoCreateTasks: boolean = true
) {
  const business = await getOrCreateBusiness();
  const res = await (await import("@/src/server/services/lead.service")).batchImportLeads(
    business.id,
    leads,
    { autoCreateTasks }
  );

  revalidatePath("/leads");
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return res;
}