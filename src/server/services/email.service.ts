import { Resend } from "resend";
import { prisma } from "@/src/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendDailyDigest(businessId: string, toEmail: string) {
  const [hotLeads, pendingTasks, overdueTasks] = await Promise.all([
    prisma.lead.count({
      where: { businessId, priority: "HOT", status: { notIn: ["CONVERTED", "LOST"] } },
    }),
    prisma.task.count({ where: { lead: { businessId }, status: "PENDING" } }),
    prisma.task.count({
      where: { lead: { businessId }, status: "PENDING", dueAt: { lt: new Date() } },
    }),
  ]);

  if (hotLeads === 0 && pendingTasks === 0 && overdueTasks === 0) {
    return null; // nothing to report, skip sending
  }

  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
      <h2>Your daily Lost Leads summary</h2>
      <ul style="line-height: 1.8;">
        <li><strong>${hotLeads}</strong> Hot Leads needing attention</li>
        <li><strong>${pendingTasks}</strong> Pending Follow-ups</li>
        <li><strong>${overdueTasks}</strong> Overdue Tasks</li>
      </ul>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">Open Dashboard →</a></p>
    </div>
  `;

  return resend.emails.send({
    from: "Lost Leads <notifications@yourdomain.com>",
    to: toEmail,
    subject: `You have ${hotLeads} hot leads and ${pendingTasks} pending follow-ups`,
    html,
  });
}

export async function sendDailyDigestForAllBusinesses() {
  const { clerkClient } = await import("@clerk/nextjs/server");
  const client = await clerkClient();
  const businesses = await prisma.business.findMany();

  for (const business of businesses) {
    try {
      const user = await client.users.getUser(business.ownerId);
      const email = user.primaryEmailAddress?.emailAddress;
      if (email) await sendDailyDigest(business.id, email);
    } catch (err) {
      console.error(`Failed digest for business ${business.id}:`, err);
    }
  }
}