import Link from "next/link";
import { getOrCreateBusiness } from "@/src/server/services/business.service";
import { listLeads } from "@/src/server/services/lead.service";
import { LeadPriority } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/shared/Form-select";
import { KanbanBoard } from "@/components/leads/kanban/kanban-board";
import { LeadsHeaderActions } from "@/components/leads/leads-header-actions";
import { List, Kanban, Sparkles } from "lucide-react";

export default async function KanbanLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; priority?: string }>;
}) {
  const params = await searchParams;
  const business = await getOrCreateBusiness();
  const leads = await listLeads(business.id, {
    search: params.q,
    priority: params.priority as LeadPriority | undefined,
  });

  return (
    <div className="p-6 space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-heading font-semibold text-[var(--ink)] tracking-tight">
              Pipeline
            </h1>
            <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-[var(--surface-raised)] border border-[var(--hairline)] text-[var(--ink-muted)]">
              {leads.length} leads
            </span>
          </div>
          <p className="text-xs text-[var(--ink-muted)] mt-1 font-sans">
            Drag cards between stages to advance deals through your sales lifecycle.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Table View Switcher Link */}
          <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs h-9">
            <Link href="/leads" title="Switch to Table view">
              <List className="size-3.5" />
              <span>Table View</span>
            </Link>
          </Button>

          <LeadsHeaderActions />
        </div>
      </div>

      {/* Filter Bar */}
      <form className="flex flex-col sm:flex-row gap-2">
        <Input
          name="q"
          defaultValue={params.q}
          placeholder="Search name, phone, email across pipeline..."
          className="flex-1 bg-[var(--surface)] border-[var(--hairline)] text-[var(--ink)]"
        />

        <div className="w-full sm:w-44">
          <FormSelect
            name="priority"
            defaultValue={params.priority ?? ""}
            placeholder="All priorities"
            options={[
              { value: "NORMAL", label: "Normal Priority" },
              { value: "HOT", label: "🔥 Hot Leads Only" },
            ]}
          />
        </div>

        <Button type="submit" variant="outline" className="text-xs h-9">
          Filter
        </Button>

        {(params.q || params.priority) && (
          <Button asChild variant="ghost" size="sm" className="text-xs h-9 text-[var(--ink-muted)]">
            <Link href="/kanbanleads">Clear</Link>
          </Button>
        )}
      </form>

      {/* Kanban Board */}
      <KanbanBoard initialLeads={leads} />
    </div>
  );
}
