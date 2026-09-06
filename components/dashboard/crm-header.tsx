"use client";

import Link from "next/link";
import { Plus, CheckSquare, Settings, Sparkles, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function CrmHeader({
  businessName,
  rescueCount,
  pendingTasks,
}: {
  businessName: string;
  rescueCount: number;
  pendingTasks: number;
}) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/60">
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {greeting}, {businessName}
          </h1>
          {rescueCount > 0 ? (
            <Badge
              variant="outline"
              className="border-orange-500/40 bg-orange-500/15 text-orange-400 gap-1 animate-pulse"
            >
              <Flame size={12} />
              {rescueCount} Urgent {rescueCount === 1 ? "Lead" : "Leads"}
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 gap-1"
            >
              <Sparkles size={12} />
              Pipeline Healthy
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Monitor incoming customer inquiries, rescue neglected deals, and drive daily follow-up momentum.
        </p>
      </div>

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
          <Link href="/settings" title="Business Settings">
            <Settings className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
