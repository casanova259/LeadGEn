import { getOrCreateBusiness } from "@/src/server/services/business.service";
import {
  getRescueQueue,
  getDashboardStats,
  getLeadAnalytics,
  getDashboardActivityAndFlow,
} from "@/src/server/services/task.service";
import { CrmHeader } from "@/components/dashboard/crm-header";
import { CrmKpiCards } from "@/components/dashboard/crm-kpi-cards";
import { CrmPipelineFlow } from "@/components/dashboard/crm-pipeline-flow";
import { CrmActionCenter } from "@/components/dashboard/crm-action-center";
import { CrmRecentLeads } from "@/components/dashboard/crm-recent-leads";
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
    <div className="min-h-screen space-y-6 p-6 max-w-7xl mx-auto">
      {/* 1. Header Bar */}
      <CrmHeader
        businessName={business.name}
        rescueCount={rescueQueue.length}
        pendingTasks={stats.pendingTasks}
      />

      {/* 2. Onboarding checklist for new accounts */}
      {totalLeads === 0 && (
        <OnboardingChecklist businessId={business.id} />
      )}

      {/* 3. Studio Admin CRM KPI Cards */}
      <CrmKpiCards
        stats={{
          totalLeads: stats.totalLeads,
          todaysLeads: stats.todaysLeads,
          rescueCount: rescueQueue.length,
          pendingTasks: stats.pendingTasks,
          overdueTasks: stats.overdueTasks,
          converted: stats.converted,
          conversionRate: analytics.conversionRate,
        }}
      />

      {/* 4. Action Center (Rescue Queue Spotlight + Daily Outreach Cockpit) */}
      <CrmActionCenter
        rescueQueue={rescueQueue}
        todayTasks={activityAndFlow.todayTasks}
        completedToday={stats.completedToday}
      />

      {/* 5. Lead Inflow & Conversion Momentum (Studio Admin Recharts) */}
      <CrmPipelineFlow
        monthlyFlow={activityAndFlow.monthlyFlow}
        bySource={analytics.bySource}
        totalLeads={stats.totalLeads}
        converted={stats.converted}
        conversionRate={analytics.conversionRate}
      />

      {/* 6. Recent Inbound Opportunities Table */}
      <CrmRecentLeads leads={activityAndFlow.recentLeads} />
    </div>
  );
}