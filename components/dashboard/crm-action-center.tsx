"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lead, Task } from "@prisma/client";
import {
  Flame,
  Phone,
  MessageSquare,
  CheckCircle2,
  CalendarDays,
  ShieldCheck,
  Clock,
  ExternalLink,
} from "lucide-react";
import { completeTaskAction } from "@/src/server/actions/task.action";
import { toast } from "@/components/ui/toast";

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
  const router = useRouter();
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [optimisticCount, setOptimisticCount] = useState(completedToday);

  useEffect(() => {
    setOptimisticCount(completedToday);
  }, [completedToday]);

  const visibleTasks = todayTasks.filter((t) => !completedIds.includes(t.id));

  // Daily target goal calculation (target 10 completed follow-ups/day)
  const dailyTarget = 10;
  const barCount = 20;
  const activeBars = Math.min(
    barCount,
    Math.round((optimisticCount / dailyTarget) * barCount)
  );

  const handleDone = async (task: Task & { lead: Lead }) => {
    // 1. Instant optimistic update
    setCompletedIds((prev) => [...prev, task.id]);
    setOptimisticCount((prev) => prev + 1);

    // 2. Immediate feedback toast
    toast({
      message: `Follow-up completed for ${task.lead.name}`,
      state: "success",
    });

    // 3. Complete in DB
    try {
      await completeTaskAction(task.id);
      router.refresh();
    } catch (err: any) {
      // Revert if error
      setCompletedIds((prev) => prev.filter((id) => id !== task.id));
      setOptimisticCount((prev) => Math.max(0, prev - 1));
      toast({
        message: `Could not complete task: ${err?.message || "Server error"}`,
        state: "error",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
      {/* 1. Rescue Queue Spotlight */}
      <div className="xl:col-span-7 flex flex-col justify-between rounded-[12px] border border-[var(--hairline)] bg-[var(--surface)] p-6">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-3 border-b border-[var(--hairline)]">
            <div className="flex items-center gap-2">
              <div
                className="flex size-6 items-center justify-center rounded-[6px]"
                style={{
                  backgroundColor:
                    rescueQueue.length > 0
                      ? "rgba(217, 101, 79, 0.15)"
                      : "rgba(94, 200, 176, 0.15)",
                  color:
                    rescueQueue.length > 0
                      ? "var(--urgent)"
                      : "var(--clear)",
                }}
              >
                {rescueQueue.length > 0 ? (
                  <Flame className="size-3.5" />
                ) : (
                  <ShieldCheck className="size-3.5" />
                )}
              </div>
              <h2 className="font-heading text-[18px] font-normal text-[var(--ink)] tracking-tight">
                Rescue Queue
              </h2>
              <span
                className="font-mono text-[12px] ml-1"
                style={{
                  color:
                    rescueQueue.length > 0
                      ? "var(--urgent)"
                      : "var(--clear)",
                }}
              >
                ({rescueQueue.length})
              </span>
            </div>

            <Link
              href="/leads?priority=HOT"
              className="text-[13px] font-sans text-[var(--accent-blue)] hover:underline"
            >
              View all hot leads
            </Link>
          </div>

          <p className="text-[13px] font-sans text-[var(--ink-muted)] mt-2 mb-4">
            {rescueQueue.length === 0
              ? "All hot leads have had a touchpoint within 24 hours. The safety net is clear."
              : "Inquiries untouched over 24 hours. Reach out immediately to prevent lost deals."}
          </p>

          {rescueQueue.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[8px] border border-dashed border-[var(--hairline)] bg-[var(--surface-raised)]/20 p-8 text-center">
              <div className="flex size-9 items-center justify-center rounded-full bg-[var(--clear)]/10 text-[var(--clear)] mb-2">
                <ShieldCheck className="size-4" />
              </div>
              <p className="text-[13px] font-sans font-medium text-[var(--ink)]">
                Nothing waiting in rescue queue
              </p>
              <p className="text-[12px] font-sans text-[var(--ink-muted)] max-w-sm mt-0.5">
                Every high-priority lead is followed up on schedule.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--hairline)] rounded-[8px] border border-[var(--hairline)] overflow-hidden bg-[var(--surface-raised)]/40">
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
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 gap-3 hover:bg-[var(--surface-raised)] transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/leads/${lead.id}`}
                          className="font-sans font-medium text-[14px] text-[var(--ink)] hover:underline flex items-center gap-1.5"
                        >
                          {lead.name}
                          <ExternalLink className="size-3 text-[var(--ink-muted)]" />
                        </Link>
                        <span className="rounded-[4px] border border-[var(--hairline)] bg-[var(--surface)] px-1.5 py-0.5 font-mono text-[10px] uppercase text-[var(--ink-muted)]">
                          {lead.source}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[12px] font-mono text-[var(--ink-muted)]">
                        <span>{lead.phone || lead.email || "No direct phone"}</span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 text-[var(--urgent)] font-mono">
                          <Clock className="size-3" />
                          {hoursAgo(lead.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Quick 1-click rescue actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {waUrl && (
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() =>
                            toast({
                              message: `Opening WhatsApp chat with ${lead.name}`,
                              state: "success",
                            })
                          }
                          className="inline-flex items-center gap-1.5 h-7 rounded-[6px] border border-[var(--clear)]/30 bg-[var(--clear)]/10 px-2.5 text-[12px] font-sans text-[var(--clear)] hover:bg-[var(--clear)]/20 transition-colors"
                        >
                          <MessageSquare className="size-3" />
                          WhatsApp
                        </a>
                      )}

                      {lead.phone && (
                        <a
                          href={`tel:${lead.phone}`}
                          onClick={() =>
                            toast({
                              message: `Initiating call to ${lead.name}`,
                              state: "info",
                            })
                          }
                          className="inline-flex items-center gap-1.5 h-7 rounded-[6px] border border-[var(--hairline)] bg-[var(--surface)] px-2.5 text-[12px] font-sans text-[var(--ink)] hover:bg-[var(--surface-raised)] transition-colors"
                        >
                          <Phone className="size-3 text-[var(--accent-blue)]" />
                          Call
                        </a>
                      )}

                      <Link
                        href={`/leads/${lead.id}`}
                        className="inline-flex items-center h-7 rounded-[6px] px-2.5 text-[12px] font-sans text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface)] transition-colors"
                      >
                        Review
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 2. Task Reminders & Daily Follow-up Velocity */}
      <div className="xl:col-span-5 flex flex-col justify-between rounded-[12px] border border-[var(--hairline)] bg-[var(--surface)] p-6">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-3 border-b border-[var(--hairline)]">
            <div className="flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded-[6px] bg-[var(--surface-raised)] text-[var(--accent-blue)]">
                <CalendarDays className="size-3.5" />
              </div>
              <h2 className="font-heading text-[18px] font-normal text-[var(--ink)] tracking-tight">
                Outreach tasks
              </h2>
            </div>

            <Link
              href="/tasks"
              className="text-[13px] font-sans text-[var(--accent-blue)] hover:underline"
            >
              View all tasks
            </Link>
          </div>

          <p className="text-[13px] font-sans text-[var(--ink-muted)] mt-2 mb-4">
            Follow-up actions scheduled for customer outreach today.
          </p>

          {/* Goal velocity bar */}
          <div className="rounded-[8px] border border-[var(--hairline)] bg-[var(--surface-raised)]/30 p-3.5 space-y-2 mb-4">
            <div className="flex items-baseline justify-between">
              <span className="text-[12px] font-sans text-[var(--ink-muted)]">
                Daily outreach velocity
              </span>
              <span className="font-mono text-[12px] text-[var(--clear)]">
                {Math.round((optimisticCount / dailyTarget) * 100)}% target
              </span>
            </div>

            <div className="font-mono text-[20px] font-medium text-[var(--ink)] leading-none">
              {optimisticCount}{" "}
              <span className="text-[12px] font-sans font-normal text-[var(--ink-muted)]">
                of {dailyTarget} completed today
              </span>
            </div>

            {/* Segmented bar visual */}
            <div className="flex h-3.5 w-full items-center gap-1 pt-1">
              {Array.from({ length: barCount }).map((_, index) => (
                <div
                  key={index}
                  className="h-full flex-1 rounded-xs transition-colors"
                  style={{
                    backgroundColor:
                      index < activeBars
                        ? "var(--accent-blue)"
                        : "var(--hairline)",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Pending tasks list */}
          {visibleTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[8px] border border-dashed border-[var(--hairline)] bg-[var(--surface-raised)]/20 p-6 text-center">
              <p className="text-[13px] font-sans text-[var(--ink-muted)]">
                All follow-ups complete for today.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--hairline)] rounded-[8px] border border-[var(--hairline)] overflow-hidden bg-[var(--surface-raised)]/40">
              {visibleTasks.slice(0, 3).map((task) => {
                const isOverdue = new Date(task.dueAt) < new Date();

                return (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 gap-2 hover:bg-[var(--surface-raised)] transition-colors"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-sans font-medium text-[13px] text-[var(--ink)] truncate">
                          {task.lead.name}
                        </span>
                        {isOverdue ? (
                          <span className="rounded-[4px] bg-[var(--urgent)]/15 px-1.5 py-0.5 font-mono text-[10px] text-[var(--urgent)]">
                            Overdue
                          </span>
                        ) : (
                          <span className="rounded-[4px] bg-[var(--surface)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--ink-muted)]">
                            {task.type.replace("_", " ")}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-mono text-[var(--ink-muted)] truncate">
                        Due: {new Date(task.dueAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        • {task.lead.phone || task.lead.email || "No contact"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDone(task)}
                      className="inline-flex items-center gap-1 h-7 rounded-[6px] border border-[var(--hairline)] bg-[var(--surface)] px-2.5 text-[12px] font-sans text-[var(--ink)] hover:bg-[var(--surface-raised)] hover:border-[var(--clear)]/40 transition-colors shrink-0 cursor-pointer"
                    >
                      <CheckCircle2 className="size-3 text-[var(--clear)]" />
                      Done
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
