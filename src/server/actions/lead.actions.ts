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
  const lead = await createLead({ ...input, businessId: business.id });
  revalidatePath("/leads");
  revalidatePath("/dashboard");
  revalidatePath("/tasks");
  return lead;
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
    source?: import("@prisma/client").LeadSource;
    priority?: import("@prisma/client").LeadPriority;
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

export async function getLeadAiRecommendationAction(leadId: string) {
  const business = await getOrCreateBusiness();
  const lead = await (await import("@/src/server/services/lead.service")).getLead(leadId, business.id);
  if (!lead) throw new Error("Lead not found or unauthorized");

  const recentNotes = lead.activities
    .filter((a) => {
      const meta = a.metadata as Record<string, unknown> | null;
      return meta?.action === "NOTE_ADDED" && typeof meta?.note === "string";
    })
    .map((a) => String((a.metadata as Record<string, unknown>).note))
    .slice(0, 3);

  const { getAiFollowUpRecommendation } = await import("@/src/server/services/ai-followup.service");

  return getAiFollowUpRecommendation({
    id: lead.id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    source: lead.source,
    status: lead.status,
    priority: lead.priority,
    notes: lead.notes,
    createdAt: lead.createdAt,
    businessName: business.name,
    industry: business.industry,
    recentNotes,
  });
}

export async function applyAiFollowUpAction(
  leadId: string,
  input: {
    channel: "WHATSAPP" | "PHONE" | "EMAIL";
    timingHours: number;
    openingHook: string;
    createTask?: boolean;
    logAsNote?: boolean;
  }
) {
  const business = await getOrCreateBusiness();
  const lead = await (await import("@/src/server/services/lead.service")).getLead(leadId, business.id);
  if (!lead) throw new Error("Lead not found or unauthorized");

  const { prisma } = await import("@/lib/prisma");

  let createdTask = null;
  if (input.createTask !== false) {
    const taskType =
      input.channel === "PHONE"
        ? "CALL"
        : input.channel === "EMAIL"
        ? "EMAIL"
        : "FOLLOW_UP";

    const dueAt = new Date(Date.now() + Math.max(1, input.timingHours) * 60 * 60 * 1000);

    // Cancel / complete existing pending tasks for this lead if any, or create next task
    createdTask = await prisma.task.create({
      data: {
        leadId,
        type: taskType,
        dueAt,
        status: "PENDING",
      },
    });
  }

  if (input.logAsNote) {
    await prisma.activity.create({
      data: {
        leadId,
        type: "LEAD_UPDATED",
        metadata: {
          action: "NOTE_ADDED",
          category: input.channel === "PHONE" ? "CALL" : "GENERAL",
          note: `[AI Follow-Up Plan] Channel: ${input.channel}. Script: "${input.openingHook}"`,
        },
      },
    });
  } else {
    await prisma.activity.create({
      data: {
        leadId,
        type: "LEAD_UPDATED",
        metadata: {
          action: "AI_RECOMMENDATION_APPLIED",
          channel: input.channel,
          openingHook: input.openingHook,
        },
      },
    });
  }

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");

  return { success: true, task: createdTask };
}