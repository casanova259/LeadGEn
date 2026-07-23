import Link from "next/link";
import { getOrCreateBusiness } from "@/src/server/services/business.service";
import { listLeads } from "@/src/server/services/lead.service";
import { LeadStatus, LeadPriority } from "@prisma/client";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; priority?: string }>;
}) {
  const params = await searchParams;
  const business = await getOrCreateBusiness();
  const leads = await listLeads(business.id, {
    search: params.q,
    status: params.status as LeadStatus | undefined,
    priority: params.priority as LeadPriority | undefined,
  });

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Leads</h1>
        <Link
          href="/leads/new"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium"
        >
          + New Lead
        </Link>
      </div>

      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={params.q}
          placeholder="Search name, phone, email..."
          className="border rounded-md px-3 py-2 text-sm flex-1"
        />
        <select name="status" defaultValue={params.status} className="border rounded-md px-3 py-2 text-sm">
          <option value="">All statuses</option>
          <option value="NEW">New</option>
          <option value="CONTACTED">Contacted</option>
          <option value="FOLLOW_UP">Follow Up</option>
          <option value="QUALIFIED">Qualified</option>
          <option value="CONVERTED">Converted</option>
          <option value="LOST">Lost</option>
        </select>
        <select name="priority" defaultValue={params.priority} className="border rounded-md px-3 py-2 text-sm">
          <option value="">All priorities</option>
          <option value="NORMAL">Normal</option>
          <option value="HOT">Hot</option>
        </select>
        <button className="border rounded-md px-4 py-2 text-sm">Filter</button>
      </form>

      <div className="border rounded-md divide-y">
        {leads.length === 0 && (
          <div className="p-6 text-sm text-muted-foreground text-center">No leads yet.</div>
        )}
        {leads.map((lead) => (
          <Link
            key={lead.id}
            href={`/leads/${lead.id}`}
            className="flex items-center justify-between px-4 py-3 hover:bg-muted text-sm"
          >
            <div>
              <div className="font-medium">
                {lead.name} {lead.priority === "HOT" && <span className="text-red-500">🔥</span>}
              </div>
              <div className="text-muted-foreground">{lead.phone || lead.email || "—"}</div>
            </div>
            <div className="text-xs text-muted-foreground">{lead.status}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}