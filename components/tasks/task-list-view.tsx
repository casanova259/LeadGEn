"use client";

import { useState, useMemo } from "react";
import { TaskType, LeadPriority } from "@prisma/client";
import { TaskRow, TaskWithLead } from "./task-row";
import { CreateTaskDialog } from "./create-task-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Phone,
  Mail,
} from "lucide-react";

interface LeadOption {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  priority: string;
}

interface TaskListViewProps {
  initialTasks: TaskWithLead[];
  leads: LeadOption[];
  stats: {
    overdue: number;
    today: number;
    upcoming: number;
    completed: number;
    total: number;
  };
}

type TabType = "all" | "overdue" | "today" | "upcoming" | "completed";

export function TaskListView({
  initialTasks,
  leads,
  stats,
}: TaskListViewProps) {
  // Default to overdue if any exist, otherwise today or all
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (stats.overdue > 0) return "overdue";
    if (stats.today > 0) return "today";
    return "all";
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | TaskType>("ALL");
  const [hotOnly, setHotOnly] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Filter tasks based on activeTab, search, and type
  const filteredTasks = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    return initialTasks.filter((task) => {
      const due = new Date(task.dueAt);

      // Tab filter
      if (activeTab === "overdue") {
        if (!(task.status === "PENDING" && due < now)) return false;
      } else if (activeTab === "today") {
        if (!(task.status === "PENDING" && due >= startOfToday && due <= endOfToday))
          return false;
      } else if (activeTab === "upcoming") {
        if (!(task.status === "PENDING" && due > endOfToday)) return false;
      } else if (activeTab === "completed") {
        if (task.status !== "COMPLETED") return false;
      }

      // Type filter
      if (typeFilter !== "ALL" && task.type !== typeFilter) {
        return false;
      }

      // Hot only
      if (hotOnly && task.lead.priority !== "HOT") {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = task.lead.name.toLowerCase().includes(q);
        const matchesPhone = task.lead.phone?.toLowerCase().includes(q);
        const matchesEmail = task.lead.email?.toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesEmail) {
          return false;
        }
      }

      return true;
    });
  }, [initialTasks, activeTab, typeFilter, hotOnly, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks & Follow-Ups</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Your daily outreach cockpit. Call, WhatsApp, and email leads directly to rescue
            inquiries before they slip away.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-1.5 shrink-0 shadow-xs">
          <Plus className="size-4" />
          <span>New Task</span>
        </Button>
      </div>

      {/* Metric Cards / Quick Filter Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
        {/* Overdue */}
        <button
          type="button"
          onClick={() => setActiveTab("overdue")}
          className={`flex flex-col text-left p-3 sm:p-3.5 rounded-xl border transition-all ${
            activeTab === "overdue"
              ? "border-red-500 bg-red-500/10 shadow-xs ring-1 ring-red-500/30"
              : "border-border/60 bg-card hover:border-red-500/30 hover:bg-muted/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Overdue</span>
            <AlertCircle
              className={`size-4 ${stats.overdue > 0 ? "text-red-500" : "text-muted-foreground"}`}
            />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span
              className={`text-2xl font-bold tracking-tight ${
                stats.overdue > 0 ? "text-red-600 dark:text-red-400" : "text-foreground"
              }`}
            >
              {stats.overdue}
            </span>
            {stats.overdue > 0 && (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
                Rescue
              </span>
            )}
          </div>
        </button>

        {/* Today */}
        <button
          type="button"
          onClick={() => setActiveTab("today")}
          className={`flex flex-col text-left p-3 sm:p-3.5 rounded-xl border transition-all ${
            activeTab === "today"
              ? "border-amber-500 bg-amber-500/10 shadow-xs ring-1 ring-amber-500/30"
              : "border-border/60 bg-card hover:border-amber-500/30 hover:bg-muted/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Due Today</span>
            <Clock className="size-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {stats.today}
            </span>
          </div>
        </button>

        {/* Upcoming */}
        <button
          type="button"
          onClick={() => setActiveTab("upcoming")}
          className={`flex flex-col text-left p-3 sm:p-3.5 rounded-xl border transition-all ${
            activeTab === "upcoming"
              ? "border-blue-500 bg-blue-500/10 shadow-xs ring-1 ring-blue-500/30"
              : "border-border/60 bg-card hover:border-blue-500/30 hover:bg-muted/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Upcoming</span>
            <Calendar className="size-4 text-blue-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {stats.upcoming}
            </span>
          </div>
        </button>

        {/* Completed */}
        <button
          type="button"
          onClick={() => setActiveTab("completed")}
          className={`flex flex-col text-left p-3 sm:p-3.5 rounded-xl border transition-all ${
            activeTab === "completed"
              ? "border-emerald-500 bg-emerald-500/10 shadow-xs ring-1 ring-emerald-500/30"
              : "border-border/60 bg-card hover:border-emerald-500/30 hover:bg-muted/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Completed</span>
            <CheckCircle2 className="size-4 text-emerald-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {stats.completed}
            </span>
          </div>
        </button>

        {/* All Tasks */}
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`col-span-2 sm:col-span-1 flex flex-col text-left p-3 sm:p-3.5 rounded-xl border transition-all ${
            activeTab === "all"
              ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/30"
              : "border-border/60 bg-card hover:border-border hover:bg-muted/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total</span>
            <SlidersHorizontal className="size-4 text-muted-foreground" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {stats.total}
            </span>
          </div>
        </button>
      </div>

      {/* Toolbar: Search, Type Filter, Priority Toggle */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks by lead name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-sm h-9 bg-card"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Type dropdown */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as "ALL" | TaskType)}
            className="h-9 rounded-md border border-input bg-card px-2.5 py-1.5 text-xs shadow-xs focus:outline-hidden focus:ring-1 focus:ring-ring text-muted-foreground hover:text-foreground"
          >
            <option value="ALL">All Types</option>
            <option value="CALL">📞 Calls</option>
            <option value="EMAIL">✉️ Emails</option>
            <option value="FOLLOW_UP">🔄 Follow-Ups</option>
          </select>

          {/* Hot leads toggle */}
          <Button
            size="sm"
            variant={hotOnly ? "default" : "outline"}
            onClick={() => setHotOnly(!hotOnly)}
            className={`h-9 text-xs gap-1 ${
              hotOnly
                ? "bg-red-500 hover:bg-red-600 text-white border-transparent shadow-xs"
                : "text-muted-foreground"
            }`}
          >
            <Flame className={`size-3.5 ${hotOnly ? "fill-white" : "text-red-500"}`} />
            <span>Hot Leads</span>
          </Button>
        </div>
      </div>

      {/* Task List Table / Container */}
      <div className="border rounded-xl bg-card overflow-hidden shadow-xs">
        {filteredTasks.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            {activeTab === "overdue" && stats.overdue === 0 ? (
              <div className="max-w-md mx-auto space-y-2">
                <div className="mx-auto size-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Sparkles className="size-6" />
                </div>
                <h3 className="font-semibold text-base">You&apos;re completely caught up!</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Zero overdue tasks. All high-priority leads have been reached within your response
                  window. Outstanding work!
                </p>
              </div>
            ) : activeTab === "today" && stats.today === 0 ? (
              <div className="max-w-md mx-auto space-y-2">
                <div className="mx-auto size-12 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <CheckCircle2 className="size-6" />
                </div>
                <h3 className="font-semibold text-base">Clear queue for today</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  No pending follow-ups scheduled for today. Check upcoming tasks or schedule a new
                  outreach.
                </p>
                <div className="pt-2">
                  <Button size="sm" onClick={() => setIsCreateOpen(true)} className="text-xs">
                    + Schedule Task
                  </Button>
                </div>
              </div>
            ) : (
              <div className="max-w-md mx-auto space-y-2">
                <p className="text-sm text-muted-foreground">
                  No tasks found matching your current filters.
                </p>
                {(searchQuery || typeFilter !== "ALL" || hotOnly) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSearchQuery("");
                      setTypeFilter("ALL");
                      setHotOnly(false);
                    }}
                    className="text-xs"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {filteredTasks.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>

      {/* Create Task Dialog */}
      <CreateTaskDialog
        leads={leads}
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </div>
  );
}
