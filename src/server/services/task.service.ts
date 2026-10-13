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
  const now = new Date();

  // Consolidate into 2 parallel queries instead of 8 separate remote queries
  const [leads, tasks] = await Promise.all([
    prisma.lead.findMany({
      where: { businessId },
      select: {
        status: true,
        priority: true,
        createdAt: true,
      },
    }),
    prisma.task.findMany({
      where: { lead: { businessId } },
      select: {
        status: true,
        dueAt: true,
        completedAt: true,
      },
    }),
  ]);

  let todaysLeads = 0;
  let hotLeads = 0;
  let converted = 0;
  let lost = 0;

  for (const lead of leads) {
    if (lead.createdAt >= startOfDay) todaysLeads++;
    if (lead.priority === "HOT" && lead.status !== "CONVERTED" && lead.status !== "LOST") hotLeads++;
    if (lead.status === "CONVERTED") converted++;
    if (lead.status === "LOST") lost++;
  }

  let pendingTasks = 0;
  let overdueTasks = 0;
  let completedToday = 0;

  for (const task of tasks) {
    if (task.status === "PENDING") {
      pendingTasks++;
      if (task.dueAt < now) overdueTasks++;
    } else if (task.status === "COMPLETED") {
      if (task.completedAt && task.completedAt >= startOfDay) completedToday++;
    }
  }

  return {
    todaysLeads,
    pendingTasks,
    hotLeads,
    converted,
    lost,
    overdueTasks,
    totalLeads: leads.length,
    completedToday,
  };
}

export async function getDashboardActivityAndFlow(businessId: string) {

  // Real daily flow: only plot real, current data up to today (no future days, no long flat baseline)
  const nowDay = new Date();
  nowDay.setHours(23, 59, 59, 999);
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
  fourteenDaysAgo.setHours(0, 0, 0, 0);

  const leadsInWindow = await prisma.lead.findMany({
    where: {
      businessId,
      createdAt: { gte: fourteenDaysAgo, lte: nowDay },
    },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  let dailyFlow: {
    date: string;
    label: string;
    inbound: number;
    isToday: boolean;
  }[] = [];

  if (leadsInWindow.length > 0) {
    // Find the first date with data in this window or at least 5 days ago to give context
    const firstDateWithData = new Date(leadsInWindow[0].createdAt);
    firstDateWithData.setHours(0, 0, 0, 0);

    // Don't start earlier than 7 days ago if first lead was recently created
    const startDate = new Date(
      Math.max(
        firstDateWithData.getTime(),
        new Date().setDate(new Date().getDate() - 6)
      )
    );
    startDate.setHours(0, 0, 0, 0);

    const todayDateStr = new Date().toISOString().split("T")[0];
    const map = new Map<string, number>();

    // Fill days from startDate to today ONLY (strictly never future dates)
    const current = new Date(startDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    while (current <= today) {
      const key = current.toISOString().split("T")[0];
      map.set(key, 0);
      current.setDate(current.getDate() + 1);
    }

    for (const lead of leadsInWindow) {
      const key = lead.createdAt.toISOString().split("T")[0];
      if (map.has(key)) {
        map.set(key, (map.get(key) || 0) + 1);
      }
    }

    dailyFlow = Array.from(map.entries()).map(([dateStr, count]) => {
      const d = new Date(dateStr + "T12:00:00Z");
      const label = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      return {
        date: dateStr,
        label,
        inbound: count,
        isToday: dateStr === todayDateStr,
      };
    });
  }

  // Calculate plain language trend summary
  let trendDescription = "No recent inquiries recorded";
  if (dailyFlow.length > 0) {
    const totalInWindow = dailyFlow.reduce((sum, d) => sum + d.inbound, 0);
    if (totalInWindow === 0) {
      trendDescription = "No inquiries recorded over recent days";
    } else if (dailyFlow.length >= 3) {
      const recent = dailyFlow.slice(-2);
      const prior = dailyFlow.slice(-4, -2);
      const recentSum = recent.reduce((sum, d) => sum + d.inbound, 0);
      const priorSum = prior.reduce((sum, d) => sum + d.inbound, 0);

      if (recentSum === 0 && priorSum >= 2) {
        const lastActive = [...dailyFlow].reverse().find((d) => d.inbound > 0);
        const dayName = lastActive
          ? new Date(lastActive.date + "T12:00:00Z").toLocaleDateString("en-US", {
              weekday: "long",
            })
          : "earlier";
        trendDescription = `Inflow has slowed sharply since ${dayName}`;
      } else if (recentSum > priorSum && priorSum > 0) {
        trendDescription = "Inflow is accelerating over the past few days";
      } else if (recentSum === priorSum && recentSum > 0) {
        trendDescription = "Inflow has held steady across recent days";
      } else {
        trendDescription = `${totalInWindow} inquiries recorded over active period`;
      }
    } else {
      trendDescription = `${totalInWindow} inquiries recorded recently`;
    }
  }

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
    monthlyFlow: [],
    dailyFlow,
    trendDescription,
    todayTasks,
    recentLeads,
  };
}