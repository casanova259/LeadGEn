"use client";

import Link from "next/link";
import { ArrowUpRight, Flame, TrendingDown, TrendingUp, Users, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardDescription, CardHeader } from "@/components/ui/card";

export type CrmKpiStats = {
  totalLeads: number;
  todaysLeads: number;
  rescueCount: number;
  pendingTasks: number;
  overdueTasks: number;
  converted: number;
  conversionRate: number;
};

export function CrmKpiCards({ stats }: { stats: CrmKpiStats }) {
  const isRescueAlert = stats.rescueCount > 0;
  const hasOverdue = stats.overdueTasks > 0;

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total Pipeline Leads */}
        <Card className="hover:border-border/80 transition-colors">
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5 font-medium">
              <Users className="size-3.5 text-muted-foreground" />
              Total Pipeline Leads
            </CardDescription>
            <CardAction>
              <Link href="/leads" className="text-muted-foreground hover:text-foreground">
                <ArrowUpRight className="size-4" />
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-semibold tracking-tight tabular-nums">
                {stats.totalLeads}
              </span>
              <Badge
                variant="outline"
                className="border-blue-500/30 bg-blue-500/10 text-blue-400"
              >
                <TrendingUp className="size-3" />
                +{stats.todaysLeads} today
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{stats.todaysLeads}</span> new inquiries captured today
            </p>
          </CardContent>
        </Card>

        {/* Rescue Queue */}
        <Card
          className={`hover:border-border/80 transition-colors ${
            isRescueAlert ? "border-orange-500/40 bg-orange-500/[0.03]" : ""
          }`}
        >
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5 font-medium">
              <Flame className={`size-3.5 ${isRescueAlert ? "text-orange-500" : "text-muted-foreground"}`} />
              Rescue Queue
            </CardDescription>
            <CardAction>
              <Link href="/leads?priority=HOT" className="text-muted-foreground hover:text-foreground">
                <ArrowUpRight className="size-4" />
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-semibold tracking-tight tabular-nums">
                {stats.rescueCount}
              </span>
              {isRescueAlert ? (
                <Badge
                  variant="outline"
                  className="border-orange-500/40 bg-orange-500/15 text-orange-400 animate-pulse"
                >
                  <Flame className="size-3" />
                  Urgent Attention
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                >
                  All Protected
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {isRescueAlert ? (
                <span className="text-orange-400 font-medium">
                  Untouched &gt;24h. Immediate contact required.
                </span>
              ) : (
                "Zero hot leads abandoned."
              )}
            </p>
          </CardContent>
        </Card>

        {/* Pending Follow-ups */}
        <Card className="hover:border-border/80 transition-colors">
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5 font-medium">
              <Clock className="size-3.5 text-muted-foreground" />
              Follow-up Queue
            </CardDescription>
            <CardAction>
              <Link href="/tasks" className="text-muted-foreground hover:text-foreground">
                <ArrowUpRight className="size-4" />
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-semibold tracking-tight tabular-nums">
                {stats.pendingTasks}
              </span>
              {hasOverdue ? (
                <Badge
                  variant="outline"
                  className="border-destructive/30 bg-destructive/10 text-destructive"
                >
                  <TrendingDown className="size-3" />
                  {stats.overdueTasks} overdue
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="border-purple-500/30 bg-purple-500/10 text-purple-400"
                >
                  Daily Queue
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {hasOverdue ? (
                <span className="text-destructive font-medium">
                  {stats.overdueTasks} tasks require rescheduling
                </span>
              ) : (
                <span className="text-muted-foreground">All follow-ups on track</span>
              )}
            </p>
          </CardContent>
        </Card>

        {/* Won / Converted Rate */}
        <Card className="hover:border-border/80 transition-colors">
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="size-3.5 text-emerald-500" />
              Converted Clients
            </CardDescription>
            <CardAction>
              <Link href="/leads?status=CONVERTED" className="text-muted-foreground hover:text-foreground">
                <ArrowUpRight className="size-4" />
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-semibold tracking-tight tabular-nums">
                {stats.converted}
              </span>
              <Badge
                variant="outline"
                className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              >
                <TrendingUp className="size-3" />
                {stats.conversionRate}% Rate
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{stats.conversionRate}%</span> conversion velocity across leads
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
