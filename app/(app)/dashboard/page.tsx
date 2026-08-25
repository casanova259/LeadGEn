import { Flame } from "lucide-react";
import { getOrCreateBusiness } from "@/src/server/services/business.service";
import {
  getRescueQueue,
  getDashboardStats,
  getLeadAnalytics,
} from "@/src/server/services/task.service";
import { AnalyticsCharts } from "@/components/shared/analytics-charts";
import { StatCard, DashboardCard } from "@/components/shared/dashboard-card";
import { ListRow, ListRowDivider } from "@/components/shared/list-row";
import { EmptyState } from "@/components/shared/empty-state";

function hoursAgo(date: Date) {
  const hrs = Math.floor((Date.now() - new Date(date).getTime()) / 36e5);
  if (hrs < 1) return "just now";
  if (hrs < 24) return `${hrs}h no contact`;
  const days = Math.floor(hrs / 24);
  return `${days}d no contact`;
}

export default async function DashboardPage() {
  const business = await getOrCreateBusiness();
  const [stats, rescueQueue, analytics] = await Promise.all([
    getDashboardStats(business.id),
    getRescueQueue(business.id),
    getLeadAnalytics(business.id),
  ]);

  const cards = [
    { label: "Today's Leads", value: stats.todaysLeads },
    { label: "Pending Tasks", value: stats.pendingTasks },
    { label: "Hot Leads", value: stats.hotLeads },
    { label: "Converted", value: stats.converted },
    { label: "Lost", value: stats.lost },
  ];

  return (
    <div className="min-h-screen space-y-6 bg-[#0a0a0a] p-6">
      <div>
        <h1 className="text-[22px] font-semibold tracking-[-0.3px] text-white">
          Dashboard
        </h1>
        <p className="text-[14px] text-zinc-500">Welcome to Lost Leads.</p>
      </div>

      {/* Stat cards — no fabricated trend %, this data doesn't include
          a prior-period comparison yet. Add `trend`/`trendLabel` props
          on StatCard once getDashboardStats() returns deltas. */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {cards.map((c) => (
          <StatCard key={c.label} label={c.label} value={String(c.value)} />
        ))}
      </div>

      {/* Rescue Queue */}
      {rescueQueue.length > 0 ? (
        <DashboardCard
          title="Rescue Queue"
          action={
            <span className="flex items-center gap-1.5 rounded-full border border-orange-900 px-2.5 py-1 text-[12px] font-medium text-orange-400">
              <Flame size={12} />
              {rescueQueue.length} need attention
            </span>
          }
        >
          <div>
            {rescueQueue.map((lead, i) => (
              <div key={lead.id}>
                <ListRow
                  href={`/leads/${lead.id}`}
                  leading={
                    <span className="h-2 w-2 shrink-0 rounded-full bg-orange-500" />
                  }
                  primary={lead.name}
                  secondary={lead.phone || lead.email || "—"}
                  trailing={hoursAgo(lead.createdAt)}
                />
                {i < rescueQueue.length - 1 && <ListRowDivider />}
              </div>
            ))}
          </div>
        </DashboardCard>
      ) : (
        <EmptyState
          icon={Flame}
          title="Nothing to rescue right now"
          description="Hot leads that go 24 hours without contact will show up here automatically."
        />
      )}

      <AnalyticsCharts
        bySource={analytics.bySource}
        byStatus={analytics.byStatus}
        conversionRate={analytics.conversionRate}
      />
    </div>
  );
}