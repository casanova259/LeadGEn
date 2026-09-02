import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createLead } from "@/src/server/services/lead.service";
import { LeadSource, LeadPriority } from "@prisma/client";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-business-id",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    let businessId = url.searchParams.get("businessId") || request.headers.get("x-business-id");

    let payload: Record<string, unknown> = {};

    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      try {
        payload = await request.json();
      } catch {
        return NextResponse.json(
          { error: "Invalid JSON payload" },
          { status: 400, headers: CORS_HEADERS }
        );
      }
    } else if (
      contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("multipart/form-data")
    ) {
      try {
        const formData = await request.formData();
        formData.forEach((value, key) => {
          payload[key] = value.toString();
        });
      } catch {
        return NextResponse.json(
          { error: "Invalid form data" },
          { status: 400, headers: CORS_HEADERS }
        );
      }
    }

    if (!businessId && typeof payload.businessId === "string") {
      businessId = payload.businessId;
    }

    if (!businessId) {
      return NextResponse.json(
        {
          error:
            "Missing businessId. Provide it via query param (?businessId=...), header (x-business-id), or body payload.",
        },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Verify business exists
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      return NextResponse.json(
        { error: "Business not found with provided businessId" },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    const name = (payload.name as string)?.trim();
    if (!name) {
      return NextResponse.json(
        { error: "Field 'name' is required" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const email = (payload.email as string)?.trim() || undefined;
    const phone = (payload.phone as string)?.trim() || undefined;
    const notes =
      ((payload.notes as string) || (payload.message as string))?.trim() || undefined;

    // Validate source if provided, default to WEBSITE
    let source: LeadSource = LeadSource.WEBSITE;
    const rawSource = (payload.source as string)?.toUpperCase();
    if (rawSource && Object.values(LeadSource).includes(rawSource as LeadSource)) {
      source = rawSource as LeadSource;
    }

    // Priority default NORMAL or HOT
    let priority: LeadPriority = LeadPriority.NORMAL;
    const rawPriority = (payload.priority as string)?.toUpperCase();
    if (rawPriority === "HOT") {
      priority = LeadPriority.HOT;
    }

    const lead = await createLead({
      businessId,
      name,
      email,
      phone,
      notes,
      source,
      priority,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Lead created successfully",
        lead: {
          id: lead.id,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          source: lead.source,
          priority: lead.priority,
          createdAt: lead.createdAt,
        },
      },
      { status: 201, headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("Error creating lead from webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
