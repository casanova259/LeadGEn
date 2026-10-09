import Link from "next/link";
import { getOrCreateBusiness } from "@/src/server/services/business.service";
import { listLeads } from "@/src/server/services/lead.service";
import { LeadStatus, LeadPriority } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/shared/Form-select";
import { LeadsTable } from "@/components/leads/leads-table";
import { LeadsHeaderActions } from "@/components/leads/leads-header-actions";
import { Search, X, Filter } from "lucide-react";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; priority?: string; created?: string }>;
}) {
  const params = await searchParams;
  const business = await getOrCreateBusiness();
  const leads = await listLeads(business.id, {
    search: params.q,
    status: params.status as LeadStatus | undefined,
    priority: params.priority as LeadPriority | undefined,
  });

  const hasActiveFilters = Boolean(params.q || params.status || params.priority);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* 1. Header with title, lead counter, and action toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="font-heading text-2xl font-normal text-[var(--ink)] tracking-tight">
              Leads Directory
            </h1>
            <span className="inline-flex items-center rounded-full bg-[var(--surface-raised)] border border-[var(--hairline)] px-2.5 py-0.5 font-mono text-xs font-medium text-[var(--ink-muted)]">
              {leads.length} {leads.length === 1 ? "contact" : "contacts"}
            </span>
          </div>
          <p className="text-xs text-[var(--ink-muted)] font-sans">
            Centralized intake registry with 1-click WhatsApp outreach and status tracking.
          </p>
        </div>
        <LeadsHeaderActions />
      </div>

      {/* 2. Search & Filtering Bar */}
      <div className="rounded-[12px] border border-[var(--hairline)] bg-[var(--surface)] p-3">
        <form className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[var(--ink-faint)]" />
            <Input
              name="q"
              defaultValue={params.q}
              placeholder="Search by name, phone number, or email..."
              className="pl-8.5 h-9 text-xs bg-background border-[var(--hairline)]"
            />
          </div>

          <div className="flex gap-2">
            <div className="w-1/2 sm:w-36">
              <FormSelect
                name="status"
                defaultValue={params.status ?? ""}
                placeholder="All stages"
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

            <div className="w-1/2 sm:w-32">
              <FormSelect
                name="priority"
                defaultValue={params.priority ?? ""}
                placeholder="All priorities"
                options={[
                  { value: "NORMAL", label: "Normal" },
                  { value: "HOT", label: "🔥 Hot" },
                ]}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" size="sm" variant="outline" className="h-9 px-3 text-xs gap-1.5 border-[var(--hairline)]">
              <Filter className="size-3 text-[var(--ink-muted)]" />
              Filter
            </Button>

            {hasActiveFilters && (
              <Button asChild size="sm" variant="ghost" className="h-9 px-2 text-xs text-[var(--ink-muted)] hover:text-[var(--ink)]">
                <Link href="/leads" title="Clear all search filters">
                  <X className="size-3.5 mr-1" />
                  Clear
                </Link>
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* 3. The Pristine Leads Table */}
      <LeadsTable leads={leads} highlightId={params.created} />
    </div>
  );
}