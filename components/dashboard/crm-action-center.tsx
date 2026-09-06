"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Lead, Task } from "@prisma/client";
import {
  Flame,
  Phone,
  MessageSquare,
  CheckCircle2,
  CalendarDays,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { completeTaskAction } from "@/src/server/actions/task.action";

function hoursAgo(date: Date) {
  const hrs = Math.floor((Date.now() - new Date(date).getTime()) / 36e5);
  if (hrs < 1) return "just now";
  if (hrs < 24) return `${hrs}h no contact`;
  const days = Math.floor(hrs / 24);
  return `${days}d no contact`;
}

function cleanPhoneNumber(phone?: string | null) {
  if (!phone) return "";
  return phone.replace(/[^\d+]/g, "");
}

export function CrmActionCenter({
  rescueQueue,
  todayTasks,
  completedToday,
}: {
  rescueQueue: Lead[];
  todayTasks: (Task & { lead: Lead })[];
  completedToday: number;
}) {
  const [isPending, startTransition] = useTransition();

  // Daily target goal calculation (e.g., target 10 completed follow-ups/day)
  const dailyTarget = 10;
  const barCount = 20;
  const activeBars = Math.min(
    barCount,
    Math.round((completedToday / dailyTarget) * barCount)
  );

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
      {/* 1. Rescue Queue Spotlight */}
      <Card
        className={`xl:col-span-7 flex flex-col justify-between ${
          rescueQueue.length > 0 ? "border-orange-500/40 bg-orange-500/[0.02]" : ""
        }`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div
              className={`flex size-7 items-center justify-center rounded-lg ${
                rescueQueue.length > 0
                  ? "bg-orange-500/15 text-orange-500"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <Flame className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                Rescue Queue
                {rescueQueue.length > 0 && (
                  <Badge
                    variant="outline"
                    className="border-orange-500/30 bg-orange-500/15 text-orange-400 text-[11px]"
                  >
                    {rescueQueue.length} Burning
                  </Badge>
                )}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Hot leads untouched for over 24 hours. Contact them immediately to avoid losing the deal.
              </p>
            </div>
          </div>
          <CardAction>
            <Button asChild variant="outline" size="sm" className="h-7 text-xs gap-1">
              <Link href="/leads?priority=HOT">
                View All Hot Leads
                <ArrowRight className="size-3" />
              </Link>
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className="pt-1">
          {rescueQueue.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-background/50 p-8 text-center">
              <div className="flex size-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mb-2">
                <ShieldCheck className="size-5" />
              </div>
              <p className="text-sm font-semibold text-foreground">Zero Abandoned Leads</p>
              <p className="text-xs text-muted-foreground max-w-sm mt-1">
                Every hot inquiry has had a touchpoint within the last 24 hours. The revenue safety net is active!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/60 rounded-xl border border-border/70 overflow-hidden bg-card/60">
              {rescueQueue.slice(0, 4).map((lead) => {
                const phoneClean = cleanPhoneNumber(lead.phone);
                const waUrl = phoneClean
                  ? `https://wa.me/${phoneClean.replace("+", "")}?text=${encodeURIComponent(
                      `Hi ${lead.name}, following up regarding your inquiry!`
                    )}`
                  : null;

                return (
                  <div
                    key={lead.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 gap-3 hover:bg-muted/40 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/leads/${lead.id}`}
                          className="font-medium text-sm text-foreground hover:underline flex items-center gap-1.5"
                        >
                          {lead.name}
                          <ExternalLink className="size-3 text-muted-foreground" />
                        </Link>
                        <Badge
                          variant="outline"
                          className="border-orange-500/30 bg-orange-500/10 text-orange-400 text-[10px] uppercase"
                        >
                          {lead.source}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{lead.phone || lead.email || "No direct phone"}</span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 text-orange-400 font-medium">
                          <Clock className="size-3" />
                          {hoursAgo(lead.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Quick 1-click rescue actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {waUrl && (
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs gap-1.5 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                        >
                          <a href={waUrl} target="_blank" rel="noopener noreferrer">
                            <MessageSquare className="size-3.5 text-emerald-500" />
                            WhatsApp
                          </a>
                        </Button>
                      )}

                      {lead.phone && (
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs gap-1.5 hover:bg-blue-500/10 hover:text-blue-400"
                        >
                          <a href={`tel:${lead.phone}`}>
                            <Phone className="size-3.5 text-blue-400" />
                            Call
                          </a>
                        </Button>
                      )}

                      <Button asChild size="sm" variant="ghost" className="h-8 text-xs">
                        <Link href={`/leads/${lead.id}`}>Review</Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Task Reminders & Follow-up Velocity */}
      <Card className="xl:col-span-5 flex flex-col justify-between">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CalendarDays className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base">Outreach Cockpit</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tasks due for customer outreach today.
              </p>
            </div>
          </div>
          <CardAction>
            <Button asChild variant="outline" size="sm" className="h-7 text-xs gap-1">
              <Link href="/tasks">
                View All Tasks
                <ArrowRight className="size-3" />
              </Link>
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className="space-y-4 pt-1">
          {/* Studio Admin Segmented Goal Bars */}
          <div className="rounded-xl border border-border/60 bg-muted/30 p-3.5 space-y-2">
            <div className="flex items-end justify-between">
              <div className="space-y-0.5">
                <span className="text-xs text-muted-foreground">Daily Outreach Velocity</span>
                <div className="text-lg font-bold tracking-tight text-foreground">
                  {completedToday}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    of {dailyTarget} completed today
                  </span>
                </div>
              </div>
              <span className="text-xs font-medium text-emerald-500">
                {Math.round((completedToday / dailyTarget) * 100)}% Target
              </span>
            </div>

            {/* Segmented bar visual from template */}
            <div className="flex h-5 w-full items-center gap-1 pt-1">
              {Array.from({ length: barCount }).map((_, index) => (
                <div
                  key={index}
                  className={`h-full flex-1 rounded-sm transition-colors ${
                    index < activeBars
                      ? "bg-primary shadow-xs"
                      : "bg-muted-foreground/20"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Pending tasks list */}
          {todayTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/80 bg-background/50 p-6 text-center">
              <Sparkles className="size-5 text-muted-foreground mb-1" />
              <p className="text-xs font-medium text-foreground">All Follow-ups Complete</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                No pending tasks due today. Great work staying ahead!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/60 rounded-xl border border-border/70 overflow-hidden bg-card/60">
              {todayTasks.slice(0, 3).map((task) => {
                const isOverdue = new Date(task.dueAt) < new Date();

                return (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 gap-2 hover:bg-muted/40 transition-colors"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-xs text-foreground truncate">
                          {task.lead.name}
                        </span>
                        {isOverdue ? (
                          <span className="text-[10px] font-semibold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">
                            Overdue
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            {task.type.replace("_", " ")}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">
                        Due: {new Date(task.dueAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} •{" "}
                        {task.lead.phone || task.lead.email || "No phone"}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isPending}
                      onClick={() => {
                        startTransition(async () => {
                          await completeTaskAction(task.id);
                        });
                      }}
                      className="h-7 text-xs gap-1 shrink-0 font-medium"
                    >
                      <CheckCircle2 className="size-3 text-emerald-500" />
                      Done
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
