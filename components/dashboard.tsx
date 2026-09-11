"use client";

import Link from "next/link";
import { Plus, CheckSquare, Settings, Flame, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardInvoices } from "@/components/dashboard-invoices";
import { SalesChart, type LeadChartRow } from "@/components/sales-chart";
import { DashboardStats, type CrmDashboardStats } from "@/components/stats";
import type { Lead } from "@prisma/client";

export type DashboardProps = {
	businessName?: string;
	stats?: CrmDashboardStats;
	flowData?: LeadChartRow[];
	recentLeads?: Lead[];
};

export function Dashboard({
	businessName = "Lost Leads CRM",
	stats,
	flowData,
	recentLeads,
}: DashboardProps) {
	const hour = new Date().getHours();
	const greeting =
		hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

	const rescueCount = stats?.rescueCount ?? 0;
	const pendingTasks = stats?.pendingTasks ?? 0;

	return (
		<div className="flex flex-1 flex-col gap-6">
			{/* Dashboard Welcome Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div className="flex flex-col gap-1">
					<div className="flex items-center gap-2.5 flex-wrap">
						<h1 className="font-bold text-2xl tracking-tight leading-tight text-foreground">
							{greeting}, {businessName}!
						</h1>
						{rescueCount > 0 ? (
							<Badge
								variant="outline"
								className="border-orange-500/40 bg-orange-500/15 text-orange-500 gap-1 animate-pulse text-xs font-medium"
							>
								<Flame className="size-3" />
								{rescueCount} Urgent {rescueCount === 1 ? "Lead" : "Leads"}
							</Badge>
						) : (
							<Badge
								variant="outline"
								className="border-emerald-500/30 bg-emerald-500/10 text-emerald-500 gap-1 text-xs font-medium"
							>
								<Sparkles className="size-3" />
								Pipeline Healthy
							</Badge>
						)}
					</div>
					<p className="text-sm text-muted-foreground">
						Rescue neglected inquiries within 24 hours, monitor inflow momentum, and close more deals.
					</p>
				</div>

				{/* Header Quick Actions */}
				<div className="flex items-center gap-2 shrink-0">
					<Button asChild variant="outline" size="sm" className="h-8 text-xs gap-1.5 font-medium">
						<Link href="/tasks">
							<CheckSquare className="size-3.5" />
							Outreach Tasks
							{pendingTasks > 0 && (
								<span className="ml-1 rounded-full bg-primary/15 text-primary text-[10px] px-1.5 py-0.2 font-semibold">
									{pendingTasks}
								</span>
							)}
						</Link>
					</Button>

					<Button asChild size="sm" className="h-8 text-xs gap-1.5 font-medium shadow-xs">
						<Link href="/leads/new">
							<Plus className="size-3.5" />
							New Lead
						</Link>
					</Button>

					<Button asChild variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground">
						<Link href="/settings" title="CRM Settings">
							<Settings className="size-4" />
						</Link>
					</Button>
				</div>
			</div>

			{/* Signature @efferd/dashboard-1 Bento Grid Container */}
			<div className="rounded-lg overflow-hidden border bg-border">
				<div className="grid grid-cols-1 gap-px bg-border lg:grid-cols-3">
					<DashboardStats stats={stats} />
					<SalesChart data={flowData} />
					<DashboardInvoices leads={recentLeads} />
				</div>
			</div>
		</div>
	);
}
