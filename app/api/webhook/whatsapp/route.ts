import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createLead } from "@/src/server/services/lead.service";
import { LeadPriority, LeadSource } from "@prisma/client";

const DEFAULT_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "lostleads_whatsapp_verify";

// 1. Meta Webhook Verification (GET)
export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === DEFAULT_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
}

// 2. Incoming WhatsApp Message Ingest (POST)
export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    let businessId = url.searchParams.get("businessId") || request.headers.get("x-business-id");

    const contentType = request.headers.get("content-type") || "";
    let name = "WhatsApp Lead";
    let phone: string | undefined = undefined;
    let messageText: string | undefined = undefined;

    if (contentType.includes("application/json")) {
      const body = await request.json();

      // Check if businessId is in payload
      if (!businessId && typeof body.businessId === "string") {
        businessId = body.businessId;
      }

      // Check for Meta WhatsApp Cloud API format
      const entry = body.entry?.[0];
      const change = entry?.changes?.[0]?.value;

      if (change?.messages?.[0]) {
        const msg = change.messages[0];
        const contact = change.contacts?.[0];

        phone = msg.from ? `+${msg.from.replace(/\D/g, "")}` : undefined;
        name = contact?.profile?.name || phone || "WhatsApp Lead";

        if (msg.type === "text") {
          messageText = msg.text?.body;
        } else if (msg.type) {
          messageText = `[Sent a ${msg.type} message]`;
        }
      } else if (body.name || body.phone || body.message || body.notes) {
        // Generic JSON format
        name = body.name || "WhatsApp Lead";
        phone = body.phone;
        messageText = body.message || body.notes;
      }
    } else if (
      contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("multipart/form-data")
    ) {
      // Twilio WhatsApp format
      const formData = await request.formData();
      const rawFrom = formData.get("From") as string | null;
      const profileName = formData.get("ProfileName") as string | null;
      const bodyText = formData.get("Body") as string | null;
      const formBusinessId = formData.get("businessId") as string | null;

      if (!businessId && formBusinessId) {
        businessId = formBusinessId;
      }

      if (rawFrom) {
        phone = rawFrom.replace("whatsapp:", "").trim();
      }
      name = profileName || phone || "WhatsApp Lead";
      messageText = bodyText || undefined;
    }

    if (!businessId) {
      // If Meta sends status updates without businessId, respond 200 to prevent webhook failure
      return NextResponse.json({ error: "Missing businessId parameter" }, { status: 400 });
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Only create lead if we have contact information or text
    if (!phone && !messageText && name === "WhatsApp Lead") {
      // Meta webhook delivery / read receipt acknowledgment
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const lead = await createLead({
      businessId,
      name,
      phone,
      notes: messageText ? `WhatsApp message: "${messageText}"` : undefined,
      source: LeadSource.WHATSAPP,
      priority: LeadPriority.HOT,
    });

    return NextResponse.json(
      {
        success: true,
        message: "WhatsApp lead created successfully",
        leadId: lead.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing WhatsApp webhook:", error);
    // Meta retries on non-200, return 200 on error to avoid retry storm if desired or 500
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
