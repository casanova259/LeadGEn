import { getOrCreateBusiness } from "@/src/server/services/business.service";
import {
  getRescueQueue,
  getDashboardStats,
  getLeadAnalytics,
  getDashboardActivityAndFlow,
} from "@/src/server/services/task.service";
import { CrmHeader } from "@/components/dashboard/crm-header";
import { StatusRail } from "@/components/dashboard/status-rail";
import { DispatchChart } from "@/components/dashboard/dispatch-chart";
import { CrmActionCenter } from "@/components/dashboard/crm-action-center";
import { OnboardingChecklist } from "@/components/shared/onboarding-checklist";

export default async function DashboardPage() {
  const business = await getOrCreateBusiness();
  const [stats, rescueQueue, analytics, activityAndFlow] = await Promise.all([
    getDashboardStats(business.id),
    getRescueQueue(business.id),
    getLeadAnalytics(business.id),
    getDashboardActivityAndFlow(business.id),
  ]);

  const totalLeads = stats.totalLeads;

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto bg-[var(--bg)] text-[var(--ink)]">
      {/* 1. Header greeting & active action buttons */}
      <CrmHeader
        businessName={business.name}
        rescueCount={rescueQueue.length}
        pendingTasks={stats.pendingTasks}
      />

      {/* 2. Onboarding checklist for new accounts */}
      {totalLeads === 0 && (
        <OnboardingChecklist businessId={business.id} />
      )}

      {/* 3. Status Rail: High-level KPI status overview */}
      <StatusRail
        totalLeads={stats.totalLeads}
        todaysLeads={stats.todaysLeads}
        rescueCount={rescueQueue.length}
        conversionRate={analytics.conversionRate}
        converted={stats.converted}
      />

      {/* 4. Rescue Queue Spotlight & Outreach Task Velocity (Primary Action Hub) */}
      <CrmActionCenter
        rescueQueue={rescueQueue}
        todayTasks={activityAndFlow.todayTasks}
        completedToday={stats.completedToday}
      />

      {/* 5. Inbound Flow Trend: Collapsible secondary analytics */}
      <DispatchChart
        dailyFlow={activityAndFlow.dailyFlow}
        trendDescription={activityAndFlow.trendDescription}
        totalInPeriod={stats.totalLeads}
      />
    </div>
  );
}