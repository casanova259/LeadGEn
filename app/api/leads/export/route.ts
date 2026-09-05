import { NextResponse } from "next/server";
import { getOrCreateBusiness } from "@/src/server/services/business.service";
import { listLeads } from "@/src/server/services/lead.service";
import { LeadStatus, LeadPriority } from "@prisma/client";

function escapeCSV(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(request: Request) {
  try {
    const business = await getOrCreateBusiness();
    const url = new URL(request.url);
    const search = url.searchParams.get("q") || undefined;
    const status = (url.searchParams.get("status") as LeadStatus) || undefined;
    const priority = (url.searchParams.get("priority") as LeadPriority) || undefined;

    const leads = await listLeads(business.id, {
      search,
      status,
      priority,
    });

    const headers = [
      "ID",
      "Name",
      "Phone",
      "Email",
      "Source",
      "Status",
      "Priority",
      "Created At",
      "Contacted At",
      "Notes",
    ];

    const rows = leads.map((lead) => [
      escapeCSV(lead.id),
      escapeCSV(lead.name),
      escapeCSV(lead.phone || ""),
      escapeCSV(lead.email || ""),
      escapeCSV(lead.source),
      escapeCSV(lead.status),
      escapeCSV(lead.priority),
      escapeCSV(lead.createdAt.toISOString()),
      escapeCSV(lead.contactedAt ? lead.contactedAt.toISOString() : ""),
      escapeCSV(lead.notes || ""),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\r\n");

    const dateStr = new Date().toISOString().split("T")[0];

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="leads-export-${dateStr}.csv"`,
      },
    });
  } catch (error) {
    console.error("Failed to export leads CSV:", error);
    return NextResponse.json({ error: "Failed to export leads" }, { status: 500 });
  }
}
