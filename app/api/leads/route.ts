import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getOrCreateBusiness } from "@/src/server/services/business.service";
import { createLead } from "@/src/server/services/lead.service";
import { LeadSource, LeadPriority } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const business = await getOrCreateBusiness();
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) {
      return NextResponse.json(
        { error: "Lead name is required" },
        { status: 400 }
      );
    }

    const email = typeof body.email === "string" ? body.email.trim() || undefined : undefined;
    const phone = typeof body.phone === "string" ? body.phone.trim() || undefined : undefined;
    const notes = typeof body.notes === "string" ? body.notes.trim() || undefined : undefined;

    // Validate and assign source
    let source: LeadSource = LeadSource.WEBSITE;
    if (body.source && Object.values(LeadSource).includes(body.source as LeadSource)) {
      source = body.source as LeadSource;
    }

    // Validate and assign priority
    let priority: LeadPriority = LeadPriority.NORMAL;
    if (body.priority && Object.values(LeadPriority).includes(body.priority as LeadPriority)) {
      priority = body.priority as LeadPriority;
    }

    const lead = await createLead({
      businessId: business.id,
      name,
      phone,
      email,
      source,
      priority,
      notes,
    });

    // Revalidate paths so cache stays fresh
    revalidatePath("/leads");
    revalidatePath("/dashboard");
    revalidatePath("/tasks");

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
          status: lead.status,
          notes: lead.notes,
          createdAt: lead.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Failed to create lead:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
