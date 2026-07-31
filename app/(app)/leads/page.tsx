"use server";


import Link from "next/link";
import { getOrCreateBusiness } from "@/src/server/services/business.service";
import { listLeads } from "@/src/server/services/lead.service";
import { LeadStatus, LeadPriority } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/shared/Form-select";

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
        <Button asChild>
          <Link href="/leads/new">+ New Lead</Link>
        </Button>
      </div>

      <form className="flex gap-2">
        <Input name="q" defaultValue={params.q} placeholder="Search name, phone, email..." className="flex-1" />

        <div className="w-40">
          <FormSelect
            name="status"
            defaultValue={params.status ?? ""}
            placeholder="All statuses"
            options={[
              { value: "NEW", label: "New" },
              { value: "CONTACTED", label: "Contacted" },
              { value: "FOLLOW_UP", label: "Follow Up" },
              { value: "QUALIFIED", label: "Qualified" },
              { value: "CONVERTED", label: "Converted" },
              { value: "LOST", label: "Lost" },
            ]}
          />
        </div>

        <div className="w-40">
          <FormSelect
            name="priority"
            defaultValue={params.priority ?? ""}
            placeholder="All priorities"
            options={[
              { value: "NORMAL", label: "Normal" },
              { value: "HOT", label: "Hot" },
            ]}
          />
        </div>

        <Button type="submit" variant="outline">Filter</Button>
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