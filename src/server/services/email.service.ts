import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { resolveOwnerEmail } from "@/src/server/services/auth.service";
import { generateFallbackFollowUpRecommendation } from "@/src/server/services/ai-followup.service";

export type DigestSendResult = {
  businessId: string;
  businessName: string;
  recipient?: string;
  status: "SENT" | "SKIPPED_EMPTY" | "SKIPPED_ALREADY_SENT" | "SKIPPED_NO_RECIPIENT" | "SKIPPED_NO_KEY" | "FAILED";
  emailId?: string;
  error?: string;
};

export type DigestBatchReport = {
  totalBusinesses: number;
  sent: number;
  skipped: number;
  failed: number;
  results: DigestSendResult[];
};

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.trim().length === 0 || apiKey.startsWith("re_placeholder")) {
    return null;
  }
  return new Resend(apiKey);
}

function getSenderAddress(): string {
  // Use configured sender or fallback to Resend's verified testing domain
  return process.env.RESEND_FROM_EMAIL || "Lost Leads <onboarding@resend.dev>";
}

/**
 * Builds a beautiful, responsive HTML email digest for a business.
 */
function renderDigestHtml({
  businessName,
  hotLeads,
  overdueTasks,
  todayTasks,
  newLeadsCount,
  aiSpotlight,
  appUrl,
}: {
  businessName: string;
  hotLeads: Array<{ id: string; name: string; source: string; phone?: string | null; email?: string | null; createdAt: Date }>;
  overdueTasks: Array<{ id: string; type: string; dueAt: Date; lead: { name: string } }>;
  todayTasks: Array<{ id: string; type: string; dueAt: Date; lead: { name: string } }>;
  newLeadsCount: number;
  aiSpotlight?: { leadName: string; channel: string; openingHook: string; rationale: string } | null;
  appUrl: string;
}): string {
  const hotLeadsHtml =
    hotLeads.length > 0
      ? hotLeads
          .slice(0, 5)
          .map(
            (l) => `
          <tr style="border-bottom: 1px solid #27272a;">
            <td style="padding: 10px 0; color: #f4f4f5; font-size: 13px; font-weight: 600;">
              <a href="${appUrl}/leads/${l.id}" style="color: #60a5fa; text-decoration: none;">${escapeHtml(l.name)}</a>
            </td>
            <td style="padding: 10px 0; color: #a1a1aa; font-size: 12px;">${escapeHtml(l.source)}</td>
            <td style="padding: 10px 0; text-align: right;">
              <span style="background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 700; text-transform: uppercase;">HOT</span>
            </td>
          </tr>`
          )
          .join("")
      : `<tr><td colspan="3" style="padding: 12px 0; color: #71717a; font-size: 12px;">No hot leads pending.</td></tr>`;

  const overdueHtml =
    overdueTasks.length > 0
      ? overdueTasks
          .slice(0, 5)
          .map(
            (t) => `
          <tr style="border-bottom: 1px solid #27272a;">
            <td style="padding: 8px 0; color: #f4f4f5; font-size: 12px;">
              <strong>${escapeHtml(t.type.replace("_", " "))}</strong> for ${escapeHtml(t.lead.name)}
            </td>
            <td style="padding: 8px 0; text-align: right; color: #f87171; font-size: 11px; font-weight: 600;">
              Overdue
            </td>
          </tr>`
          )
          .join("")
      : `<tr><td colspan="2" style="padding: 8px 0; color: #71717a; font-size: 12px;">Zero overdue tasks. All caught up!</td></tr>`;

  const aiSpotlightSection = aiSpotlight
    ? `
      <div style="margin: 24px 0; padding: 16px; background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.25); border-radius: 12px;">
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <span style="color: #818cf8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">✨ AI Recommended Action Today</span>
        </div>
        <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 600; color: #f4f4f5;">
          ${escapeHtml(aiSpotlight.leadName)} — Recommended channel: <span style="color: #38bdf8;">${escapeHtml(aiSpotlight.channel)}</span>
        </p>
        <p style="margin: 0 0 10px 0; font-size: 12px; color: #a1a1aa; line-height: 1.5; font-style: italic;">
          &ldquo;${escapeHtml(aiSpotlight.openingHook)}&rdquo;
        </p>
        <p style="margin: 0; font-size: 11px; color: #818cf8;">
          💡 ${escapeHtml(aiSpotlight.rationale)}
        </p>
      </div>`
    : "";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Your Daily Lost Leads Digest</title>
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f4f4f5;">
  <div style="max-width: 560px; margin: 0 auto; padding: 32px 20px;">

    <!-- Header -->
    <div style="margin-bottom: 24px; text-align: left;">
      <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #60a5fa;">Lost Leads Executive Digest</span>
      <h1 style="margin: 6px 0 0 0; font-size: 20px; font-weight: 700; color: #ffffff;">${escapeHtml(businessName)}</h1>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #71717a;">Morning operational summary & outreach priorities</p>
    </div>

    <!-- Quick Stats Metric Rail -->
    <div style="display: table; width: 100%; margin-bottom: 24px; background: #18181b; border: 1px solid #27272a; border-radius: 12px; text-align: center;">
      <div style="display: table-cell; padding: 14px 8px; border-right: 1px solid #27272a;">
        <span style="display: block; font-size: 20px; font-weight: 700; color: ${hotLeads.length > 0 ? "#f87171" : "#f4f4f5"};">${hotLeads.length}</span>
        <span style="display: block; font-size: 10px; color: #a1a1aa; text-transform: uppercase; margin-top: 2px;">Hot Leads</span>
      </div>
      <div style="display: table-cell; padding: 14px 8px; border-right: 1px solid #27272a;">
        <span style="display: block; font-size: 20px; font-weight: 700; color: ${overdueTasks.length > 0 ? "#fbbf24" : "#f4f4f5"};">${overdueTasks.length}</span>
        <span style="display: block; font-size: 10px; color: #a1a1aa; text-transform: uppercase; margin-top: 2px;">Overdue</span>
      </div>
      <div style="display: table-cell; padding: 14px 8px; border-right: 1px solid #27272a;">
        <span style="display: block; font-size: 20px; font-weight: 700; color: #60a5fa;">${todayTasks.length}</span>
        <span style="display: block; font-size: 10px; color: #a1a1aa; text-transform: uppercase; margin-top: 2px;">Due Today</span>
      </div>
      <div style="display: table-cell; padding: 14px 8px;">
        <span style="display: block; font-size: 20px; font-weight: 700; color: #34d399;">${newLeadsCount}</span>
        <span style="display: block; font-size: 10px; color: #a1a1aa; text-transform: uppercase; margin-top: 2px;">New Today</span>
      </div>
    </div>

    ${aiSpotlightSection}

    <!-- Hot Leads Section -->
    <div style="margin-bottom: 24px;">
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 0.05em;">Hot Leads Requiring Contact</h2>
      <table style="width: 100%; border-collapse: collapse;">
        ${hotLeadsHtml}
      </table>
    </div>

    <!-- Overdue & Scheduled Tasks -->
    <div style="margin-bottom: 28px;">
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 0.05em;">Overdue Follow-Up Tasks</h2>
      <table style="width: 100%; border-collapse: collapse;">
        ${overdueHtml}
      </table>
    </div>

    <!-- Call to action button -->
    <div style="text-align: center; margin: 32px 0 24px 0;">
      <a href="${appUrl}/dashboard" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-size: 13px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 8px;">
        Open Lost Leads Dashboard →
      </a>
    </div>

    <!-- Footer -->
    <div style="border-top: 1px solid #27272a; padding-top: 16px; text-align: center;">
      <p style="margin: 0; font-size: 11px; color: #71717a;">
        Lost Leads • Keeping inquiries warm and eliminating lead decay
      </p>
    </div>

  </div>
</body>
</html>
`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Sends a daily digest email for a single business.
 * Supports idempotency: skips sending if already delivered on the same calendar day.
 */
export async function sendDailyDigest(
  businessId: string,
  toEmail: string,
  options?: { force?: boolean }
): Promise<DigestSendResult> {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
  });

  if (!business) {
    return {
      businessId,
      businessName: "Unknown",
      status: "FAILED",
      error: "Business record not found",
    };
  }

  const todayStr = new Date().toISOString().split("T")[0];

  // 1. Check idempotency: check if already sent today (unless forced)
  if (!options?.force) {
    const existingLog = await prisma.activity.findFirst({
      where: {
        lead: { businessId },
        type: "LEAD_UPDATED",
        metadata: {
          path: ["action"],
          equals: "DAILY_DIGEST_SENT",
        },
        createdAt: {
          gte: new Date(todayStr + "T00:00:00.000Z"),
        },
      },
    });

    if (existingLog) {
      return {
        businessId,
        businessName: business.name,
        recipient: toEmail,
        status: "SKIPPED_ALREADY_SENT",
      };
    }
  }

  // 2. Collect tenant-isolated data
  const now = new Date();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const hotLeads = await prisma.lead.findMany({
    where: {
      businessId,
      priority: "HOT",
      status: { notIn: ["CONVERTED", "LOST"] },
    },
    select: { id: true, name: true, source: true, phone: true, email: true, createdAt: true, notes: true },
    orderBy: { createdAt: "asc" },
    take: 6,
  });

  const overdueTasks = await prisma.task.findMany({
    where: {
      lead: { businessId },
      status: "PENDING",
      dueAt: { lt: now },
    },
    select: { id: true, type: true, dueAt: true, lead: { select: { name: true } } },
    orderBy: { dueAt: "asc" },
    take: 6,
  });

  const todayTasks = await prisma.task.findMany({
    where: {
      lead: { businessId },
      status: "PENDING",
      dueAt: { gte: startOfDay, lte: endOfDay },
    },
    select: { id: true, type: true, dueAt: true, lead: { select: { name: true } } },
    orderBy: { dueAt: "asc" },
    take: 6,
  });

  const newLeadsCount = await prisma.lead.count({
    where: {
      businessId,
      createdAt: { gte: startOfDay },
    },
  });

  // If nothing to report across all vectors, skip sending
  if (hotLeads.length === 0 && overdueTasks.length === 0 && todayTasks.length === 0 && newLeadsCount === 0) {
    return {
      businessId,
      businessName: business.name,
      recipient: toEmail,
      status: "SKIPPED_EMPTY",
    };
  }

  // Generate AI spotlight recommendation for top hot or overdue lead
  let aiSpotlight = null;
  if (hotLeads.length > 0) {
    const topLead = hotLeads[0];
    const rec = generateFallbackFollowUpRecommendation({
      id: topLead.id,
      name: topLead.name,
      email: topLead.email,
      phone: topLead.phone,
      source: topLead.source,
      status: "NEW",
      priority: "HOT",
      notes: topLead.notes,
      createdAt: topLead.createdAt,
      businessName: business.name,
    });
    aiSpotlight = {
      leadName: topLead.name,
      channel: rec.channel,
      openingHook: rec.openingHook,
      rationale: rec.rationale,
    };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const html = renderDigestHtml({
    businessName: business.name,
    hotLeads,
    overdueTasks,
    todayTasks,
    newLeadsCount,
    aiSpotlight,
    appUrl,
  });

  const resend = getResendClient();
  if (!resend) {
    // If no Resend API key is configured (local dev / test), log gracefully
    console.log(
      `[Resend Digest Dry-Run] Skipped sending to ${toEmail} for "${business.name}" (RESEND_API_KEY not configured).`
    );
    return {
      businessId,
      businessName: business.name,
      recipient: toEmail,
      status: "SKIPPED_NO_KEY",
    };
  }

  try {
    const sender = getSenderAddress();
    const subject = `[Lost Leads] ${hotLeads.length} hot leads and ${overdueTasks.length + todayTasks.length} tasks needing attention`;

    const sendRes = await resend.emails.send({
      from: sender,
      to: toEmail,
      subject,
      html,
    });

    if (sendRes.error) {
      console.error(`Resend API error for business ${business.id}:`, sendRes.error);
      return {
        businessId,
        businessName: business.name,
        recipient: toEmail,
        status: "FAILED",
        error: sendRes.error.message,
      };
    }

    // Record digest sent activity on first available lead for idempotency tracking
    const firstLead = hotLeads[0];
    if (firstLead) {
      await prisma.activity.create({
        data: {
          leadId: firstLead.id,
          type: "LEAD_UPDATED",
          metadata: {
            action: "DAILY_DIGEST_SENT",
            date: todayStr,
            emailId: sendRes.data?.id,
          },
        },
      });
    }

    return {
      businessId,
      businessName: business.name,
      recipient: toEmail,
      status: "SENT",
      emailId: sendRes.data?.id,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    console.error(`Failed to send digest for business ${businessId}:`, errorMsg);
    return {
      businessId,
      businessName: business.name,
      recipient: toEmail,
      status: "FAILED",
      error: errorMsg,
    };
  }
}

/**
 * Iterates through all registered businesses and dispatches their daily digest.
 * Returns a comprehensive batch execution report.
 */
export async function sendDailyDigestForAllBusinesses(
  options?: { force?: boolean }
): Promise<DigestBatchReport> {
  const businesses = await prisma.business.findMany();
  const results: DigestSendResult[] = [];

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const business of businesses) {
    try {
      const email = await resolveOwnerEmail(business.ownerId);
      if (!email) {
        results.push({
          businessId: business.id,
          businessName: business.name,
          status: "SKIPPED_NO_RECIPIENT",
        });
        skipped++;
        continue;
      }

      const res = await sendDailyDigest(business.id, email, options);
      results.push(res);

      if (res.status === "SENT") {
        sent++;
      } else if (res.status === "FAILED") {
        failed++;
      } else {
        skipped++;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      results.push({
        businessId: business.id,
        businessName: business.name,
        status: "FAILED",
        error: errorMsg,
      });
      failed++;
    }
  }

  return {
    totalBusinesses: businesses.length,
    sent,
    skipped,
    failed,
    results,
  };
}