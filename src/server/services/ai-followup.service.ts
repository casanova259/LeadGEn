import { GoogleGenAI } from "@google/genai";
import { prisma } from "@/lib/prisma";
import { LeadSource, LeadPriority, LeadStatus, TaskType } from "@prisma/client";

export type AiFollowUpRecommendation = {
  channel: "WHATSAPP" | "PHONE" | "EMAIL";
  urgency: "IMMEDIATE" | "TODAY" | "SCHEDULED";
  timingHours: number;
  openingHook: string;
  talkingPoints: string[];
  rationale: string;
  source: "gemini" | "rule-based-fallback";
};

export type LeadContextForAi = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  source: LeadSource;
  status: LeadStatus;
  priority: LeadPriority;
  notes?: string | null;
  createdAt: Date;
  businessName?: string;
  industry?: string | null;
  recentNotes?: string[];
};

/**
 * Deterministic, rule-based fallback recommendation generator.
 * Provides high-quality follow-up advice when no AI API key is configured
 * or when the external AI provider is unavailable.
 */
export function generateFallbackFollowUpRecommendation(
  lead: LeadContextForAi
): AiFollowUpRecommendation {
  const isHot = lead.priority === "HOT";
  const hasPhone = Boolean(lead.phone && lead.phone.trim().length > 0);
  const hasEmail = Boolean(lead.email && lead.email.trim().length > 0);
  const notesLower = (lead.notes || "").toLowerCase();

  // Channel determination
  let channel: AiFollowUpRecommendation["channel"] = "PHONE";
  if (lead.source === "WHATSAPP" && hasPhone) {
    channel = "WHATSAPP";
  } else if (hasPhone && (isHot || lead.source.includes("ADS"))) {
    channel = "WHATSAPP";
  } else if (!hasPhone && hasEmail) {
    channel = "EMAIL";
  }

  // Urgency determination
  let urgency: AiFollowUpRecommendation["urgency"] = "TODAY";
  let timingHours = 4;

  if (isHot || lead.source.includes("ADS")) {
    urgency = "IMMEDIATE";
    timingHours = 1;
  } else if (lead.status === "CONTACTED" || lead.status === "FOLLOW_UP") {
    urgency = "SCHEDULED";
    timingHours = 24;
  }

  // Personalized opening hook
  const bizLabel = lead.businessName ? ` from ${lead.businessName}` : "";
  let openingHook = `Hi ${lead.name}, thank you for reaching out to us${bizLabel}! I'm following up regarding your recent inquiry. When is a convenient time for a quick 2-minute chat?`;

  if (lead.source === "WEBSITE") {
    openingHook = `Hi ${lead.name}, this is our team${bizLabel}. We received your inquiry through our website. I would love to answer your questions and share how we can help. Are you available for a brief conversation today?`;
  } else if (lead.source.includes("ADS")) {
    openingHook = `Hi ${lead.name}! Thanks for checking out our offer${bizLabel}. I wanted to connect while your request is fresh to share the details and see what questions you have. Does morning or afternoon suit you best?`;
  } else if (lead.source === "WHATSAPP") {
    openingHook = `Hi ${lead.name}! Thanks for messaging${bizLabel}. I'm here to assist you with your inquiry. What are you looking to achieve?`;
  }

  // Talking points based on notes and context
  const talkingPoints: string[] = [];

  if (notesLower.includes("price") || notesLower.includes("pricing") || notesLower.includes("cost") || notesLower.includes("quote")) {
    talkingPoints.push("Provide clear tier pricing and current seasonal promotions.");
  } else {
    talkingPoints.push("Clarify specific requirements, desired timeline, and immediate goals.");
  }

  if (notesLower.includes("consult") || notesLower.includes("appointment") || notesLower.includes("visit")) {
    talkingPoints.push("Offer 2 specific time slots for an initial consultation or visit.");
  } else {
    talkingPoints.push("Confirm preferred communication channel (WhatsApp or Phone).");
  }

  talkingPoints.push("Establish a concrete next step and schedule follow-up if undecided.");

  const rationale = isHot
    ? `High-priority inquiry from ${lead.source}. Immediate outreach within 1-2 hours increases conversion by up to 391%.`
    : `Standard inquiry from ${lead.source}. Consistent follow-up within 24 hours prevents lead from turning cold.`;

  return {
    channel,
    urgency,
    timingHours,
    openingHook,
    talkingPoints,
    rationale,
    source: "rule-based-fallback",
  };
}

/**
 * Generates an AI-powered follow-up recommendation using Google Gemini (via @google/genai SDK)
 * with graceful fallback to rule-based generation if API key is not configured or fails.
 */
export async function getAiFollowUpRecommendation(
  leadContext: LeadContextForAi
): Promise<AiFollowUpRecommendation> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;

  if (!apiKey) {
    return generateFallbackFollowUpRecommendation(leadContext);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are an expert sales follow-up strategist for small service businesses.
Analyze this lead and provide an optimal follow-up recommendation in strict JSON format.

Lead Details:
- Name: ${leadContext.name}
- Phone Available: ${leadContext.phone ? "Yes" : "No"}
- Email Available: ${leadContext.email ? "Yes" : "No"}
- Channel Source: ${leadContext.source}
- Status: ${leadContext.status}
- Priority: ${leadContext.priority}
- Business Name: ${leadContext.businessName || "Local Business"}
- Industry: ${leadContext.industry || "Service Provider"}
- Inbound Notes: ${leadContext.notes || "None provided"}
- Recent Activity Notes: ${leadContext.recentNotes?.join(" | ") || "None"}

Return ONLY a JSON object with this exact shape:
{
  "channel": "WHATSAPP" | "PHONE" | "EMAIL",
  "urgency": "IMMEDIATE" | "TODAY" | "SCHEDULED",
  "timingHours": number (e.g. 1, 2, 4, 24),
  "openingHook": "concise, warm, professional opening text message or script under 45 words tailored to the lead",
  "talkingPoints": ["2 to 3 concise bullet points to address in conversation"],
  "rationale": "1 brief sentence explaining the strategy"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const text = response.text?.trim();
    if (!text) {
      return generateFallbackFollowUpRecommendation(leadContext);
    }

    const parsed = JSON.parse(text);

    return {
      channel: ["WHATSAPP", "PHONE", "EMAIL"].includes(parsed.channel)
        ? parsed.channel
        : "PHONE",
      urgency: ["IMMEDIATE", "TODAY", "SCHEDULED"].includes(parsed.urgency)
        ? parsed.urgency
        : "TODAY",
      timingHours: typeof parsed.timingHours === "number" ? parsed.timingHours : 4,
      openingHook: typeof parsed.openingHook === "string" ? parsed.openingHook : "",
      talkingPoints: Array.isArray(parsed.talkingPoints) ? parsed.talkingPoints : [],
      rationale: typeof parsed.rationale === "string" ? parsed.rationale : "",
      source: "gemini",
    };
  } catch (err) {
    console.warn("AI recommendation generation failed, falling back to rule-based engine:", err);
    return generateFallbackFollowUpRecommendation(leadContext);
  }
}

/**
 * Idempotently ensures an initial follow-up task exists for a lead.
 * If a pending task of this type already exists, avoids creating duplicates.
 */
export async function ensureInitialFollowUpTask(
  leadId: string,
  dueAtDate?: Date,
  type: TaskType = "FOLLOW_UP"
) {
  // Check if an active PENDING task already exists for this lead
  const existingPending = await prisma.task.findFirst({
    where: {
      leadId,
      status: "PENDING",
    },
  });

  if (existingPending) {
    return existingPending;
  }

  const dueAt = dueAtDate || new Date(Date.now() + 24 * 60 * 60 * 1000);

  return prisma.task.create({
    data: {
      leadId,
      type,
      dueAt,
      status: "PENDING",
    },
  });
}
