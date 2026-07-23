import { prisma } from "@/src/lib/prisma";
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