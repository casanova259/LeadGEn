import { prisma } from "@/src/lib/prisma";

export async function listTasks(businessId: string) {
  return prisma.task.findMany({
    where: { lead: { businessId } },
    include: { lead: true },
    orderBy: { dueAt: "asc" },
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

export async function getDashboardStats(businessId: string) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [todaysLeads, pendingTasks, hotLeads, converted, lost] = await Promise.all([
    prisma.lead.count({ where: { businessId, createdAt: { gte: startOfDay } } }),
    prisma.task.count({ where: { lead: { businessId }, status: "PENDING" } }),
    prisma.lead.count({ where: { businessId, priority: "HOT", status: { notIn: ["CONVERTED", "LOST"] } } }),
    prisma.lead.count({ where: { businessId, status: "CONVERTED" } }),
    prisma.lead.count({ where: { businessId, status: "LOST" } }),
  ]);

  return { todaysLeads, pendingTasks, hotLeads, converted, lost };
}