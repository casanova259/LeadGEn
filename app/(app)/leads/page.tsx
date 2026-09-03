

import Link from "next/link";
import { getOrCreateBusiness } from "@/src/server/services/business.service";
import { listLeads } from "@/src/server/services/lead.service";
import { LeadStatus, LeadPriority } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/shared/Form-select";

import { InlineLeadRow } from "@/components/shared/inline-lead-row";

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
        <div>
          <h1 className="text-2xl font-semibold">Leads</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Click &ldquo;Edit&rdquo; on any lead to update contact details, status, or notes inline.
          </p>
        </div>
        <Button asChild>
          <Link href="/leads/new">+ New Lead</Link>
        </Button>
      </div>

      <form className="flex flex-col sm:flex-row gap-2">
        <Input name="q" defaultValue={params.q} placeholder="Search name, phone, email..." className="flex-1" />

        <div className="flex gap-2">
          <div className="w-1/2 sm:w-40">
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

          <div className="w-1/2 sm:w-40">
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
        </div>

        <Button type="submit" variant="outline">Filter</Button>
      </form>

      <div className="border rounded-md divide-y bg-card">
        {leads.length === 0 && (
          <div className="p-6 text-sm text-muted-foreground text-center">No leads yet.</div>
        )}
        {leads.map((lead) => (
          <InlineLeadRow key={lead.id} lead={lead} />
        ))}
      </div>
    </div>
  );
}