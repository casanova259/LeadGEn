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
}

export async function deleteLeadAction(id: string) {
  const business = await getOrCreateBusiness();
  await deleteLead(id, business.id);
  revalidatePath("/leads");
  redirect("/leads");
}