import { prisma } from "@/lib/prisma";
import { LeadStatus, LeadPriority, LeadSource, Prisma } from "@prisma/client";

export type CreateLeadInput = {
  businessId: string;
  name: string;
  phone?: string;
  email?: string;
  source: LeadSource;
  priority?: LeadPriority;
  notes?: string;
};

export type UpdateLeadInput = Partial<{
  name: string;
  phone: string;
  email: string;
  source: LeadSource;
  status: LeadStatus;
  priority: LeadPriority;
  notes: string;
  contactedAt: Date;
}>;

export async function createLead(input: CreateLeadInput) {
  const lead = await prisma.lead.create({
    data: {
      businessId: input.businessId,
      name: input.name,
      phone: input.phone,
      email: input.email,
      source: input.source,
      priority: input.priority ?? "NORMAL",
      notes: input.notes,
    },
  });

  await prisma.activity.create({
    data: { leadId: lead.id, type: "LEAD_CREATED" },
  });

  // Auto follow-up task, 24h out
  await prisma.task.create({
    data: {
      leadId: lead.id,
      type: "FOLLOW_UP",
      dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  return lead;
}

export async function updateLead(id: string, businessId: string, input: UpdateLeadInput) {
  const existing = await prisma.lead.findFirst({ where: { id, businessId } });
  if (!existing) throw new Error("Lead not found");

  const lead = await prisma.lead.update({
    where: { id },
    data: input,
  });

  if (input.status && input.status !== existing.status) {
    await prisma.activity.create({
      data: {
        leadId: id,
        type: input.status === "CONVERTED" ? "LEAD_CONVERTED" : "STATUS_CHANGED",
        metadata: { from: existing.status, to: input.status },
      },
    });
  } else {
    await prisma.activity.create({
      data: { leadId: id, type: "LEAD_UPDATED" },
    });
  }

  return lead;
}

export async function deleteLead(id: string, businessId: string) {
  const existing = await prisma.lead.findFirst({ where: { id, businessId } });
  if (!existing) throw new Error("Lead not found");
  return prisma.lead.delete({ where: { id } });
}

export async function getLead(id: string, businessId: string) {
  return prisma.lead.findFirst({
    where: { id, businessId },
    include: { tasks: true, activities: { orderBy: { createdAt: "desc" } } },
  });
}

export async function listLeads(
  businessId: string,
  opts?: { search?: string; status?: LeadStatus; priority?: LeadPriority }
) {
  const where: Prisma.LeadWhereInput = { businessId };

  if (opts?.status) where.status = opts.status;
  if (opts?.priority) where.priority = opts.priority;
  if (opts?.search) {
    where.OR = [
      { name: { contains: opts.search, mode: "insensitive" } },
      { phone: { contains: opts.search, mode: "insensitive" } },
      { email: { contains: opts.search, mode: "insensitive" } },
    ];
  }

  return prisma.lead.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

export type AddNoteInput = {
  note: string;
  category: "CALL" | "VOICEMAIL" | "MEETING" | "GENERAL";
  scheduleFollowUp?: boolean;
  followUpDueAt?: Date;
};

export async function addLeadNote(
  leadId: string,
  businessId: string,
  input: AddNoteInput
) {
  const lead = await prisma.lead.findFirst({
    where: { id: leadId, businessId },
  });
  if (!lead) throw new Error("Lead not found or unauthorized");

  const activity = await prisma.activity.create({
    data: {
      leadId,
      type: "LEAD_UPDATED",
      metadata: {
        action: "NOTE_ADDED",
        note: input.note,
        category: input.category,
      },
    },
  });

  // If follow-up requested, create task
  let task = null;
  if (input.scheduleFollowUp && input.followUpDueAt) {
    task = await prisma.task.create({
      data: {
        leadId,
        type: input.category === "CALL" ? "CALL" : "FOLLOW_UP",
        dueAt: input.followUpDueAt,
        status: "PENDING",
      },
    });
  }

  return { activity, task };
}

export type ImportLeadRow = {
  name: string;
  phone?: string;
  email?: string;
  source?: LeadSource;
  priority?: LeadPriority;
  notes?: string;
};

export async function batchImportLeads(
  businessId: string,
  rows: ImportLeadRow[],
  options?: { autoCreateTasks?: boolean }
) {
  const autoTasks = options?.autoCreateTasks ?? true;
  let importedCount = 0;
  let errorCount = 0;

  for (const row of rows) {
    if (!row.name || !row.name.trim()) {
      errorCount++;
      continue;
    }

    try {
      const lead = await prisma.lead.create({
        data: {
          businessId,
          name: row.name.trim(),
          phone: row.phone?.trim() || null,
          email: row.email?.trim() || null,
          source: row.source || "OTHER",
          priority: row.priority || "NORMAL",
          notes: row.notes?.trim() || null,
        },
      });

      await prisma.activity.create({
        data: {
          leadId: lead.id,
          type: "LEAD_CREATED",
          metadata: { imported: true },
        },
      });

      if (autoTasks) {
        await prisma.task.create({
          data: {
            leadId: lead.id,
            type: "FOLLOW_UP",
            dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        });
      }

      importedCount++;
    } catch (err) {
      console.error("Failed to import lead row", row, err);
      errorCount++;
    }
  }

  return { importedCount, errorCount };
}