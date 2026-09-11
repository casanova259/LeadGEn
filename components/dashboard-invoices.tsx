"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Flame, ArrowUpRight, Plus, PhoneCall } from "lucide-react";
import type { Lead } from "@prisma/client";

function formatRelative(date: Date | string) {
	const hrs = Math.floor((Date.now() - new Date(date).getTime()) / 36e5);
	if (hrs < 1) return "just now";
	if (hrs < 24) return `${hrs}h ago`;
	const days = Math.floor(hrs / 24);
	return `${days}d ago`;
}

function getInitials(name: string) {
	return name
		.split(" ")
		.map((n) => n[0])
		.slice(0, 2)
		.join("")
		.toUpperCase();
}

const STATUS_CONFIG: Record<
	string,
	{ label: string; variant: "default" | "secondary" | "outline" | "destructive"; className?: string }
> = {
	NEW: { label: "New", variant: "outline", className: "border-blue-500/30 bg-blue-500/10 text-blue-500" },
	CONTACTED: { label: "Contacted", variant: "outline", className: "border-amber-500/30 bg-amber-500/10 text-amber-500" },
	FOLLOW_UP: { label: "Follow Up", variant: "outline", className: "border-purple-500/30 bg-purple-500/10 text-purple-500" },
	QUALIFIED: { label: "Qualified", variant: "outline", className: "border-indigo-500/30 bg-indigo-500/10 text-indigo-500" },
	CONVERTED: { label: "Converted", variant: "secondary", className: "bg-emerald-500/10 text-emerald-500 font-medium" },
	LOST: { label: "Lost", variant: "outline", className: "text-muted-foreground" },
};

const fallbackLeads = [
	{
		id: "demo-1",
		name: "Dr. Elena Rostova",
		phone: "+1 (555) 382-9912",
		email: "elena@rostovadental.com",
		source: "WEBSITE",
		status: "NEW",
		priority: "HOT",
		createdAt: new Date(Date.now() - 28 * 36e5), // >24h = Rescue
	},
	{
		id: "demo-2",
		name: "Marcus Vance",
		phone: "+1 (555) 749-1104",
		email: "m.vance@apexcreative.io",
		source: "WEBHOOK",
		status: "NEW",
		priority: "NORMAL",
		createdAt: new Date(Date.now() - 3 * 36e5),
	},
	{
		id: "demo-3",
		name: "Sarah Jenkins",
		phone: "+1 (555) 890-4412",
		email: "sjenkins@summitrealty.com",
		source: "REFERRAL",
		status: "CONTACTED",
		priority: "HOT",
		createdAt: new Date(Date.now() - 12 * 36e5),
	},
	{
		id: "demo-4",
		name: "Liam O'Connor",
		phone: "+1 (555) 231-8971",
		email: "liam@celticproperties.com",
		source: "FORM",
		status: "CONVERTED",
		priority: "NORMAL",
		createdAt: new Date(Date.now() - 48 * 36e5),
	},
];

export function DashboardInvoices({ leads }: { leads?: Lead[] }) {
	const currentLeads = leads && leads.length > 0 ? leads : fallbackLeads;

	return (
		<Card className="rounded-none bg-background shadow-none ring-0 lg:col-span-3">
			<CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3">
				<div>
					<CardTitle className="text-base font-semibold">Recent Inbound Opportunities</CardTitle>
					<CardDescription>Live incoming customer leads and priority follow-up statuses.</CardDescription>
				</div>
				<div className="flex items-center gap-2">
					<Button asChild variant="outline" size="sm" className="h-8 text-xs gap-1">
						<Link href="/leads/new">
							<Plus className="size-3.5" />
							New Lead
						</Link>
					</Button>
					<Button asChild variant="ghost" size="sm" className="h-8 text-xs gap-1 text-muted-foreground hover:text-foreground">
						<Link href="/leads">
							View all
							<ArrowUpRight className="size-3.5" />
						</Link>
					</Button>
				</div>
			</CardHeader>
			<CardContent className="px-0 pb-2">
				<Table className="border-t">
					<TableCaption className="sr-only">
						Recent inbound leads with contact information, channel, time, and rescue status.
					</TableCaption>
					<TableHeader>
						<TableRow>
							<TableHead className="pl-6">Lead</TableHead>
							<TableHead>Channel</TableHead>
							<TableHead>Captured</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className="pr-6 text-right">Action</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{currentLeads.map((lead) => {
							const isRescue =
								lead.priority === "HOT" &&
								lead.status === "NEW" &&
								Date.now() - new Date(lead.createdAt).getTime() > 24 * 60 * 60 * 1000;
							const statusCfg = STATUS_CONFIG[lead.status] || STATUS_CONFIG.NEW;

							return (
								<TableRow className="h-14 hover:bg-muted/50" key={lead.id}>
									<TableCell className="pl-6">
										<div className="flex items-center gap-2.5">
											<span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
												{getInitials(lead.name)}
											</span>
											<div className="min-w-0">
												<Link
													href={`/leads/${lead.id}`}
													className="font-medium text-sm hover:underline block truncate max-w-44 sm:max-w-xs"
												>
													{lead.name}
												</Link>
												<span className="text-xs text-muted-foreground block truncate">
													{lead.phone || lead.email || "No contact info"}
												</span>
											</div>
										</div>
									</TableCell>
									<TableCell className="text-xs text-muted-foreground">
										<span className="capitalize">{lead.source?.toLowerCase().replace("_", " ")}</span>
									</TableCell>
									<TableCell className="text-xs text-muted-foreground tabular-nums">
										{formatRelative(lead.createdAt)}
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-1.5 flex-wrap">
											{isRescue ? (
												<Badge
													variant="outline"
													className="border-orange-500/40 bg-orange-500/15 text-orange-500 text-[11px] gap-1 animate-pulse"
												>
													<Flame className="size-3" />
													Rescue &gt;24h
												</Badge>
											) : (
												<Badge
													variant={statusCfg.variant}
													className={statusCfg.className}
												>
													{statusCfg.label}
												</Badge>
											)}
										</div>
									</TableCell>
									<TableCell className="pr-6 text-right">
										<Button asChild variant="ghost" size="sm" className="h-7 text-xs gap-1">
											<Link href={`/leads/${lead.id}`}>
												Open
												<ArrowUpRight className="size-3" />
											</Link>
										</Button>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
