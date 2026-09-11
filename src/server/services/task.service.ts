import { prisma } from "@/lib/prisma";
import { TaskType, Prisma } from "@prisma/client";

export async function listTasks(businessId: string, opts?: {
  status?: string;
  type?: TaskType;
  search?: string;
}) {
  const where: Prisma.TaskWhereInput = {
    lead: { businessId },
  };

  if (opts?.type) {
    where.type = opts.type;
  }

  if (opts?.search) {
    where.lead = {
      businessId,
      OR: [
        { name: { contains: opts.search, mode: "insensitive" } },
        { phone: { contains: opts.search, mode: "insensitive" } },
        { email: { contains: opts.search, mode: "insensitive" } },
      ],
    };
  }

  return prisma.task.findMany({
    where,
    include: { lead: true },
    orderBy: [
      { status: "asc" }, // PENDING first
      { dueAt: "asc" },
    ],
  });
}

export async function getTaskStats(businessId: string) {
  const now = new Date();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const [overdue, today, upcoming, completed, total] = await Promise.all([
    prisma.task.count({
      where: {
        lead: { businessId },
        status: "PENDING",
        dueAt: { lt: now },
      },
    }),
    prisma.task.count({
      where: {
        lead: { businessId },
        status: "PENDING",
        dueAt: { gte: startOfToday, lte: endOfToday },
      },
    }),
    prisma.task.count({
      where: {
        lead: { businessId },
        status: "PENDING",
        dueAt: { gt: endOfToday },
      },
    }),
    prisma.task.count({
      where: {
        lead: { businessId },
        status: "COMPLETED",
      },
    }),
    prisma.task.count({
      where: {
        lead: { businessId },
      },
    }),
  ]);

  return { overdue, today, upcoming, completed, total };
}

export async function createTask(
  businessId: string,
  input: { leadId: string; type: TaskType; dueAt: Date }
) {
  const lead = await prisma.lead.findFirst({
    where: { id: input.leadId, businessId },
  });
  if (!lead) throw new Error("Lead not found or unauthorized");

  const task = await prisma.task.create({
    data: {
      leadId: input.leadId,
      type: input.type,
      dueAt: input.dueAt,
      status: "PENDING",
    },
    include: { lead: true },
  });

  await prisma.activity.create({
    data: {
      leadId: input.leadId,
      type: "LEAD_UPDATED",
      metadata: { action: "TASK_CREATED", taskType: input.type, dueAt: input.dueAt },
    },
  });

  return task;
}

export async function rescheduleTask(id: string, businessId: string, newDueAt: Date) {
  const task = await prisma.task.findFirst({
    where: { id, lead: { businessId } },
  });
  if (!task) throw new Error("Task not found or unauthorized");

  const updated = await prisma.task.update({
    where: { id },
    data: {
      dueAt: newDueAt,
      status: "PENDING",
    },
    include: { lead: true },
  });

  await prisma.activity.create({
    data: {
      leadId: task.leadId,
      type: "LEAD_UPDATED",
      metadata: { action: "TASK_RESCHEDULED", newDueAt },
    },
  });

  return updated;
}

export async function deleteTask(id: string, businessId: string) {
  const task = await prisma.task.findFirst({
    where: { id, lead: { businessId } },
  });
  if (!task) throw new Error("Task not found or unauthorized");

  return prisma.task.delete({
    where: { id },
  });
}

export async function completeTask(id: string, businessId: string) {
  const task = await prisma.task.findFirst({
    where: { id, lead: { businessId } },
  });
  if (!task) throw new Error("Task not found");

  const updated = await prisma.task.update({
    where: { id },
    data: { status: "COMPLETED", completedAt: new Date() },
  });

  await prisma.activity.create({
    data: { leadId: task.leadId, type: "TASK_COMPLETED" },
  });

  return updated;
}

export async function getRescueQueue(businessId: string) {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return prisma.lead.findMany({
    where: {
      businessId,
      priority: "HOT",
      status: "NEW",
      createdAt: { lt: cutoff },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getRescueQueueCount(businessId: string) {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return prisma.lead.count({
    where: {
      businessId,
      priority: "HOT",
      status: "NEW",
      createdAt: { lt: cutoff },
    },
  });
}

export async function getLeadAnalytics(businessId: string) {
  const [bySource, byStatus] = await Promise.all([
    prisma.lead.groupBy({
      by: ["source"],
      where: { businessId },
      _count: true,
    }),
    prisma.lead.groupBy({
      by: ["status"],
      where: { businessId },
      _count: true,
    }),
  ]);

  const total = byStatus.reduce((sum, s) => sum + s._count, 0);
  const converted = byStatus.find((s) => s.status === "CONVERTED")?._count ?? 0;
  const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0;

  return {
    bySource: bySource.map((s) => ({ name: s.source, value: s._count })),
    byStatus: byStatus.map((s) => ({ name: s.status, value: s._count })),
    conversionRate,
  };
}

export async function getDashboardStats(businessId: string) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [
    todaysLeads,
    pendingTasks,
    hotLeads,
    converted,
    lost,
    overdueTasks,
    totalLeads,
    completedToday,
  ] = await Promise.all([
    prisma.lead.count({ where: { businessId, createdAt: { gte: startOfDay } } }),
    prisma.task.count({ where: { lead: { businessId }, status: "PENDING" } }),
    prisma.lead.count({
      where: { businessId, priority: "HOT", status: { notIn: ["CONVERTED", "LOST"] } },
    }),
    prisma.lead.count({ where: { businessId, status: "CONVERTED" } }),
    prisma.lead.count({ where: { businessId, status: "LOST" } }),
    prisma.task.count({
      where: { lead: { businessId }, status: "PENDING", dueAt: { lt: new Date() } },
    }),
    prisma.lead.count({ where: { businessId } }),
    prisma.task.count({
      where: {
        lead: { businessId },
        status: "COMPLETED",
        completedAt: { gte: startOfDay },
      },
    }),
  ]);

  return {
    todaysLeads,
    pendingTasks,
    hotLeads,
    converted,
    lost,
    overdueTasks,
    totalLeads,
    completedToday,
  };
}

export async function getDashboardActivityAndFlow(businessId: string) {
  const now = new Date();

  // 6-month monthly flow
  const monthsData: { month: string; date: string; leads: number; converted: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextD = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const [leadCount, convertedCount] = await Promise.all([
      prisma.lead.count({
        where: {
          businessId,
          createdAt: { gte: d, lt: nextD },
        },
      }),
      prisma.lead.count({
        where: {
          businessId,
          status: "CONVERTED",
          updatedAt: { gte: d, lt: nextD },
        },
      }),
    ]);

    monthsData.push({
      month: d.toLocaleString("en-US", { month: "short" }),
      date: d.toISOString(),
      leads: leadCount,
      converted: convertedCount,
    });
  }

  // 30-day daily flow
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const [leadsIn30Days, convertedIn30Days] = await Promise.all([
    prisma.lead.findMany({
      where: {
        businessId,
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { createdAt: true },
    }),
    prisma.lead.findMany({
      where: {
        businessId,
        status: "CONVERTED",
        updatedAt: { gte: thirtyDaysAgo },
      },
      select: { updatedAt: true },
    }),
  ]);

  const dailyMap = new Map<string, { inbound: number; converted: number }>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateKey = d.toISOString().split("T")[0];
    dailyMap.set(dateKey, { inbound: 0, converted: 0 });
  }

  for (const l of leadsIn30Days) {
    const key = l.createdAt.toISOString().split("T")[0];
    const existing = dailyMap.get(key);
    if (existing) {
      existing.inbound += 1;
    }
  }

  for (const c of convertedIn30Days) {
    const key = c.updatedAt.toISOString().split("T")[0];
    const existing = dailyMap.get(key);
    if (existing) {
      existing.converted += 1;
    }
  }

  const dailyFlow = Array.from(dailyMap.entries()).map(([date, counts]) => ({
    date,
    inbound: counts.inbound,
    converted: counts.converted,
  }));

  // Top pending tasks for today/overdue
  const todayTasks = await prisma.task.findMany({
    where: {
      lead: { businessId },
      status: "PENDING",
    },
    take: 6,
    orderBy: { dueAt: "asc" },
    include: { lead: true },
  });

  // Most recent inbound leads
  const recentLeads = await prisma.lead.findMany({
    where: { businessId },
    take: 8,
    orderBy: { createdAt: "desc" },
    include: {
      tasks: {
        take: 1,
        where: { status: "PENDING" },
      },
    },
  });

  return {
    monthlyFlow: monthsData,
    dailyFlow,
    todayTasks,
    recentLeads,
  };
}