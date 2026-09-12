"use client";

import Link from "next/link";
import { Settings, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

export function CrmHeader({
  businessName,
  pendingTasks,
}: {
  businessName: string;
  rescueCount?: number;
  pendingTasks: number;
}) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 border-b border-[var(--hairline)]">
      <div className="space-y-1">
        <h1 className="font-heading text-[28px] font-normal tracking-[-0.3px] text-[var(--ink)]">
          {greeting}, {businessName}
        </h1>
        <p className="text-[13px] font-sans text-[var(--ink-muted)]">
          Dispatch desk — real-time lead tracking and follow-up management
        </p>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-8 rounded-[8px] border-[var(--hairline)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--surface-raised)] text-[13px] font-sans transition-colors focus-visible:ring-1 focus-visible:ring-[var(--accent-blue)]"
        >
          <Link href="/tasks">
            Outreach tasks
            {pendingTasks > 0 && (
              <span className="ml-1.5 font-mono text-[12px] text-[var(--ink-faint)]">
                ({pendingTasks})
              </span>
            )}
          </Link>
        </Button>

        <Button
          asChild
          size="sm"
          className="h-8 rounded-[8px] bg-[var(--accent-blue)] text-[#0C0E11] hover:bg-[var(--accent-blue)]/90 text-[13px] font-sans font-medium transition-colors focus-visible:ring-1 focus-visible:ring-[var(--accent-blue)]"
        >
          <Link href="/leads/new">+ New lead</Link>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            toast({
              message: "Dispatch Desk: Real-time toast system online",
              state: "success",
              action: {
                label: "Undo",
                run: () => toast("Action reversed"),
              },
            });
          }}
          className="h-8 rounded-[8px] border-[var(--hairline)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--surface-raised)] text-[13px] font-sans transition-colors focus-visible:ring-1 focus-visible:ring-[var(--accent-blue)]"
          title="Test toast notification"
        >
          <Bell className="size-3.5 mr-1.5 text-[var(--accent-blue)]" />
          Test toast
        </Button>

        <Button
          asChild
          variant="ghost"
          size="icon"
          className="size-8 rounded-[8px] text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-raised)] transition-colors"
        >
          <Link href="/settings" title="Business settings">
            <Settings className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
