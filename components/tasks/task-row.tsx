"use client";

import { useState } from "react";
import Link from "next/link";
import { TaskType, TaskStatus, LeadPriority } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  completeTaskAction,
  rescheduleTaskAction,
  deleteTaskAction,
} from "@/src/server/actions/task.action";
import {
  Phone,
  Mail,
  MessageSquare,
  Clock,
  CheckCircle2,
  Circle,
  Flame,
  MoreVertical,
  Calendar,
  Trash2,
  RotateCw,
  ExternalLink,
} from "lucide-react";

export interface TaskWithLead {
  id: string;
  type: TaskType;
  dueAt: Date | string;
  status: TaskStatus;
  completedAt: Date | string | null;
  leadId: string;
  lead: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    priority: LeadPriority;
    status: string;
    source: string;
  };
}

interface TaskRowProps {
  task: TaskWithLead;
}

export function TaskRow({ task }: TaskRowProps) {
  const [isPending, setIsPending] = useState(false);
  const [showSnoozeMenu, setShowSnoozeMenu] = useState(false);

  const due = new Date(task.dueAt);
  const now = new Date();
  const isOverdue = task.status === "PENDING" && due < now;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  const isDueToday = task.status === "PENDING" && due >= startOfToday && due <= endOfToday;

  const handleComplete = async () => {
    setIsPending(true);
    try {
      await completeTaskAction(task.id);
    } catch (err) {
      console.error("Failed to complete task", err);
    } finally {
      setIsPending(false);
    }
  };

  const handleSnooze = async (hours: number) => {
    setIsPending(true);
    setShowSnoozeMenu(false);
    try {
      const newDue = new Date(Date.now() + hours * 60 * 60 * 1000);
      await rescheduleTaskAction(task.id, newDue.toISOString());
    } catch (err) {
      console.error("Failed to reschedule task", err);
    } finally {
      setIsPending(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    setIsPending(true);
    setShowSnoozeMenu(false);
    try {
      await deleteTaskAction(task.id);
    } catch (err) {
      console.error("Failed to delete task", err);
    } finally {
      setIsPending(false);
    }
  };

  const cleanPhone = task.lead.phone ? task.lead.phone.replace(/[^0-9+]/g, "") : null;
  const waPhone = cleanPhone ? cleanPhone.replace("+", "") : null;

  // Format relative due label
  const formatDueLabel = () => {
    if (task.status === "COMPLETED") {
      return (
        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
          <CheckCircle2 className="size-3.5" />
          Completed {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : ""}
        </span>
      );
    }

    if (isOverdue) {
      const diffHours = Math.round((now.getTime() - due.getTime()) / (1000 * 60 * 60));
      const text =
        diffHours < 24
          ? `Overdue by ${Math.max(1, diffHours)}h`
          : `Overdue by ${Math.round(diffHours / 24)}d`;

      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[11px] font-semibold text-red-600">
          <Clock className="size-3" />
          {text} · {due.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      );
    }

    if (isDueToday) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-600">
          <Clock className="size-3" />
          Today at {due.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Calendar className="size-3" />
        Due {due.toLocaleDateString([], { month: "short", day: "numeric" })} at{" "}
        {due.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </span>
    );
  };

  const getTypeBadge = () => {
    switch (task.type) {
      case "CALL":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-600">
            <Phone className="size-3" />
            Phone Call
          </span>
        );
      case "EMAIL":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-violet-500/10 px-2 py-0.5 text-[11px] font-medium text-violet-600">
            <Mail className="size-3" />
            Email
          </span>
        );
      case "FOLLOW_UP":
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
            <Clock className="size-3" />
            Follow-Up
          </span>
        );
    }
  };

  return (
    <div
      className={`group flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:px-4 sm:py-3.5 transition-colors border-b last:border-b-0 hover:bg-muted/40 ${
        isOverdue ? "bg-red-500/[0.02]" : ""
      } ${task.status === "COMPLETED" ? "opacity-60" : ""}`}
    >
      {/* Left section: Checkbox & Info */}
      <div className="flex items-start gap-3 min-w-0">
        <button
          type="button"
          onClick={handleComplete}
          disabled={isPending || task.status === "COMPLETED"}
          className="mt-0.5 shrink-0 text-muted-foreground hover:text-primary transition-colors focus:outline-hidden"
          title={task.status === "COMPLETED" ? "Completed" : "Click to mark done"}
        >
          {task.status === "COMPLETED" ? (
            <CheckCircle2 className="size-5 text-emerald-500 fill-emerald-500/20" />
          ) : (
            <Circle className="size-5 hover:stroke-primary" />
          )}
        </button>

        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/leads/${task.leadId}`}
              className={`font-medium hover:underline text-sm truncate flex items-center gap-1 ${
                task.status === "COMPLETED" ? "line-through text-muted-foreground" : "text-foreground"
              }`}
            >
              {task.lead.name}
              <ExternalLink className="size-3 opacity-0 group-hover:opacity-60 transition-opacity" />
            </Link>

            {task.lead.priority === "HOT" && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-red-500/10 px-1.5 py-0.2 text-[10px] font-semibold text-red-600 border border-red-500/20">
                <Flame className="size-2.5 fill-red-500" />
                HOT
              </span>
            )}

            {getTypeBadge()}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {formatDueLabel()}

            {task.lead.phone && (
              <span className="hidden md:inline-block text-muted-foreground/60">·</span>
            )}
            {task.lead.phone && (
              <span className="hidden md:inline-block truncate font-mono text-[11px]">
                {task.lead.phone}
              </span>
            )}

            {task.lead.email && (
              <span className="hidden lg:inline-block text-muted-foreground/60">·</span>
            )}
            {task.lead.email && (
              <span className="hidden lg:inline-block truncate text-[11px]">
                {task.lead.email}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right section: 1-Click Outreach and Actions */}
      <div className="flex items-center gap-1.5 mt-3 sm:mt-0 sm:ml-4 shrink-0 self-end sm:self-center">
        {/* 1-Click Outreach Buttons */}
        {task.status === "PENDING" && (
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/50">
            {cleanPhone ? (
              <Button
                asChild
                size="icon-xs"
                variant="ghost"
                className="hover:bg-blue-500/15 hover:text-blue-600 text-muted-foreground"
                title={`Call ${task.lead.phone}`}
              >
                <a href={`tel:${cleanPhone}`}>
                  <Phone className="size-3.5" />
                  <span className="sr-only">Call</span>
                </a>
              </Button>
            ) : null}

            {waPhone ? (
              <Button
                asChild
                size="icon-xs"
                variant="ghost"
                className="hover:bg-emerald-500/15 hover:text-emerald-600 text-muted-foreground"
                title={`WhatsApp ${task.lead.phone}`}
              >
                <a
                  href={`https://wa.me/${waPhone}?text=Hi%20${encodeURIComponent(
                    task.lead.name
                  )},%20reaching%20out%20from%20our%20team.`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageSquare className="size-3.5" />
                  <span className="sr-only">WhatsApp</span>
                </a>
              </Button>
            ) : null}

            {task.lead.email ? (
              <Button
                asChild
                size="icon-xs"
                variant="ghost"
                className="hover:bg-violet-500/15 hover:text-violet-600 text-muted-foreground"
                title={`Email ${task.lead.email}`}
              >
                <a
                  href={`mailto:${task.lead.email}?subject=Follow-up%20with%20${encodeURIComponent(
                    task.lead.name
                  )}`}
                >
                  <Mail className="size-3.5" />
                  <span className="sr-only">Email</span>
                </a>
              </Button>
            ) : null}
          </div>
        )}

        {/* Snooze / Reschedule Dropdown */}
        {task.status === "PENDING" && (
          <div className="relative">
            <Button
              size="xs"
              variant="outline"
              onClick={() => setShowSnoozeMenu(!showSnoozeMenu)}
              disabled={isPending}
              className="text-xs gap-1"
            >
              <RotateCw className="size-3" />
              <span className="hidden md:inline">Snooze</span>
            </Button>

            {showSnoozeMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowSnoozeMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 z-50 w-44 rounded-lg border bg-popover p-1 shadow-lg text-xs space-y-0.5">
                  <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Reschedule
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSnooze(24)}
                    className="w-full text-left px-2 py-1.5 rounded-md hover:bg-muted transition-colors flex items-center justify-between"
                  >
                    <span>+1 Day (Tomorrow)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSnooze(72)}
                    className="w-full text-left px-2 py-1.5 rounded-md hover:bg-muted transition-colors flex items-center justify-between"
                  >
                    <span>+3 Days</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSnooze(168)}
                    className="w-full text-left px-2 py-1.5 rounded-md hover:bg-muted transition-colors flex items-center justify-between"
                  >
                    <span>+1 Week</span>
                  </button>
                  <div className="border-t my-1" />
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="w-full text-left px-2 py-1.5 rounded-md hover:bg-destructive/10 text-destructive transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="size-3" />
                    <span>Delete task</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Mark Done Button */}
        {task.status === "PENDING" ? (
          <Button
            size="xs"
            variant="outline"
            onClick={handleComplete}
            disabled={isPending}
            className="text-xs font-medium border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-600"
          >
            {isPending ? "Saving..." : "Mark Done"}
          </Button>
        ) : (
          <span className="text-[11px] text-muted-foreground px-2 py-1">
            Done
          </span>
        )}
      </div>
    </div>
  );
}
