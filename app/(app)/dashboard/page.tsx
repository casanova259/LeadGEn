import { getOrCreateBusiness } from "@/src/server/services/business.service";
import {
  getRescueQueue,
  getDashboardStats,
  getLeadAnalytics,
  getDashboardActivityAndFlow,
} from "@/src/server/services/task.service";
import { Dashboard } from "@/components/dashboard";
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
    <div className="min-h-screen space-y-8 p-6 max-w-7xl mx-auto">
      {/* 1. Onboarding checklist for fresh accounts */}
      {totalLeads === 0 && (
        <OnboardingChecklist businessId={business.id} />
      )}

      {/* 2. Signature @efferd/dashboard-1 Bento Grid Suite */}
      <Dashboard
        businessName={business.name}
        stats={{
          totalLeads: stats.totalLeads,
          todaysLeads: stats.todaysLeads,
          rescueCount: rescueQueue.length,
          pendingTasks: stats.pendingTasks,
          overdueTasks: stats.overdueTasks,
          converted: stats.converted,
          conversionRate: analytics.conversionRate,
        }}
        flowData={activityAndFlow.dailyFlow}
        recentLeads={activityAndFlow.recentLeads}
      />

      {/* 3. Daily Outreach Cockpit (1-Click Calls, Emails, Snooze & Rescue Priority) */}
      <div className="pt-2">
        <CrmActionCenter
          rescueQueue={rescueQueue}
          todayTasks={activityAndFlow.todayTasks}
          completedToday={stats.completedToday}
        />
      </div>
    </div>
  );
}