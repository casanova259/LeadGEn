"use client";

import { cn } from "@/lib/utils";
import type React from "react";
import Link from "next/link";
import { Flame, Sparkles, ArrowUpRight } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Delta, DeltaIcon, DeltaValue } from "@/components/delta";

export type CrmDashboardStats = {
	totalLeads: number;
	todaysLeads: number;
	rescueCount: number;
	pendingTasks: number;
	overdueTasks: number;
	converted: number;
	conversionRate: number;
};

export function DashboardStats({ stats }: { stats?: CrmDashboardStats }) {
	const currentStats = stats ?? {
		totalLeads: 0,
		todaysLeads: 0,
		rescueCount: 0,
		pendingTasks: 0,
		overdueTasks: 0,
		converted: 0,
		conversionRate: 0,
	};

	const isRescueUrgent = currentStats.rescueCount > 0;

	return (
		<>
			{/* 1. Total Inbound Opportunities */}
			<Card className="rounded-none bg-background shadow-none ring-0">
				<CardHeader className="flex flex-row items-center justify-between pb-2">
					<CardTitle className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
						Inbound Pipeline
					</CardTitle>
					<CardDescription className="flex items-center gap-1 text-xs tabular-nums">
						{currentStats.todaysLeads > 0 ? (
							<Delta value={currentStats.todaysLeads} variant="badge">
								<DeltaIcon variant="trend" />
								<span>+{currentStats.todaysLeads} today</span>
							</Delta>
						) : (
							<span className="text-muted-foreground text-xs">Today</span>
						)}
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-1">
					<div className="flex items-baseline justify-between">
						<p className="font-semibold text-2xl tracking-tight tabular-nums">
							{currentStats.totalLeads}
						</p>
						<Link
							href="/leads"
							className="text-muted-foreground hover:text-foreground text-xs flex items-center gap-0.5 transition-colors"
						>
							View all <ArrowUpRight className="size-3" />
						</Link>
					</div>
					<p className="text-xs text-muted-foreground">
						{currentStats.todaysLeads > 0
							? `${currentStats.todaysLeads} captured in the last 24h`
							: "Total captured inquiries"}
					</p>
				</CardContent>
			</Card>

			{/* 2. Rescue Queue Spotlight */}
			<Card
				className={cn(
					"rounded-none bg-background shadow-none ring-0 transition-colors",
					isRescueUrgent && "bg-orange-500/[0.04]"
				)}
			>
				<CardHeader className="flex flex-row items-center justify-between pb-2">
					<CardTitle className="font-medium text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
						Rescue Queue
						{isRescueUrgent ? (
							<Flame className="size-3.5 text-orange-500 animate-pulse" />
						) : (
							<Sparkles className="size-3.5 text-emerald-500" />
						)}
					</CardTitle>
					<CardDescription className="flex items-center gap-1 text-xs tabular-nums">
						{isRescueUrgent ? (
							<Badge
								variant="outline"
								className="border-orange-500/40 bg-orange-500/15 text-orange-500 text-[10px] px-1.5 py-0 font-medium"
							>
								Urgent &gt;24h
							</Badge>
						) : (
							<Badge
								variant="outline"
								className="border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-[10px] px-1.5 py-0 font-medium"
							>
								Queue Clear
							</Badge>
						)}
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-1">
					<div className="flex items-baseline justify-between">
						<p
							className={cn(
								"font-semibold text-2xl tracking-tight tabular-nums",
								isRescueUrgent ? "text-orange-500 font-bold" : ""
							)}
						>
							{currentStats.rescueCount}
						</p>
						<Link
							href="/leads?rescue=true"
							className="text-muted-foreground hover:text-foreground text-xs flex items-center gap-0.5 transition-colors"
						>
							{isRescueUrgent ? "Rescue now" : "Inspect"}{" "}
							<ArrowUpRight className="size-3" />
						</Link>
					</div>
					<p className="text-xs text-muted-foreground">
						{isRescueUrgent
							? `${currentStats.rescueCount} uncontacted after 24h`
							: "0 neglected opportunities"}
					</p>
				</CardContent>
			</Card>

			{/* 3. Conversion Rate Momentum */}
			<Card className="rounded-none bg-background shadow-none ring-0">
				<CardHeader className="flex flex-row items-center justify-between pb-2">
					<CardTitle className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
						Conversion Rate
					</CardTitle>
					<CardDescription className="flex items-center gap-1 text-xs tabular-nums">
						<Delta value={currentStats.conversionRate > 0 ? currentStats.conversionRate : 0}>
							<DeltaIcon variant="trend" />
							<DeltaValue />
						</Delta>
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-1">
					<div className="flex items-baseline justify-between">
						<p className="font-semibold text-2xl tracking-tight tabular-nums">
							{currentStats.conversionRate}%
						</p>
						<span className="text-muted-foreground text-xs">
							{currentStats.converted} converted
						</span>
					</div>
					<p className="text-xs text-muted-foreground">
						{currentStats.totalLeads > 0
							? `${currentStats.converted} of ${currentStats.totalLeads} total leads closed`
							: "Awaiting initial deals"}
					</p>
				</CardContent>
			</Card>
		</>
	);
}
