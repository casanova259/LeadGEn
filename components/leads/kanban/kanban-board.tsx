"use client";

import React, { useState, useEffect, useMemo, FormEvent } from "react";
import { LeadStatus } from "@prisma/client";
import { SerializedLead } from "@/components/shared/inline-lead-row";
import { LeadCard, KanbanStage } from "./kanban-card";
import { updateLeadAction } from "@/src/server/actions/lead.actions";
import { toast } from "@/components/ui/toast";
import { Plus, Loader2 } from "lucide-react";

import {
  Kanban,
  KanbanBoard as ReUIKanbanBoard,
  KanbanColumn,
  KanbanColumnContent,
  KanbanItem,
  KanbanItemHandle,
  KanbanOverlay,
  type KanbanCommitMeta,
} from "@/src/components/reui/kanban";

// ── Stage config ──────────────────────────────────────────────
const STAGES: {
  key: KanbanStage;
  title: string;
  dotColor: string;
  headingColor: string;
  status: LeadStatus;
}[] = [
  {
    key: "NEW",
    title: "New",
    dotColor: "var(--accent-blue)",
    headingColor: "text-[var(--accent-blue)]",
    status: LeadStatus.NEW,
  },
  {
    key: "FOLLOW_UP",
    title: "Followed Up",
    dotColor: "var(--attention)",
    headingColor: "text-[var(--attention)]",
    status: LeadStatus.FOLLOW_UP,
  },
  {
    key: "CONVERTED",
    title: "Converted 🎉",
    dotColor: "var(--clear)",
    headingColor: "text-[var(--clear)]",
    status: LeadStatus.CONVERTED,
  },
];

/** Map any LeadStatus to the kanban column key it belongs in. */
function stageForStatus(status: LeadStatus): KanbanStage | null {
  if (status === "NEW") return "NEW";
  if (status === "CONVERTED") return "CONVERTED";
  if (status === "LOST") return null; // not shown on board
  return "FOLLOW_UP"; // CONTACTED, FOLLOW_UP, QUALIFIED
}

/** Build the `Record<KanbanStage, SerializedLead[]>` the Kanban expects. */
function buildColumns(leads: SerializedLead[]): Record<string, SerializedLead[]> {
  const cols: Record<string, SerializedLead[]> = {
    NEW: [],
    FOLLOW_UP: [],
    CONVERTED: [],
  };
  for (const lead of leads) {
    const stage = stageForStatus(lead.status);
    if (stage) cols[stage].push(lead);
  }
  return cols;
}

// ── Quick-add form ────────────────────────────────────────────
function QuickAddForm({
  stage,
  onAdd,
}: {
  stage: KanbanStage;
  onAdd: (name: string, stage: KanbanStage) => Promise<void>;
}) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      await onAdd(trimmed, stage);
      setName("");
      setAdding(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (!adding) {
    return (
      <button
        type="button"
        onClick={() => setAdding(true)}
        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-[8px] border border-dashed border-[var(--hairline)]/80 py-2 text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] hover:border-[var(--hairline)] hover:bg-[var(--surface-raised)]/30 transition-all cursor-pointer"
      >
        <Plus className="size-3.5" />
        <span>Add card</span>
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-2 rounded-[8px] border border-[var(--hairline)] bg-[var(--surface-raised)] p-2.5 shadow-sm space-y-2"
    >
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
        placeholder="Lead full name..."
        disabled={submitting}
        className="w-full rounded-[6px] border border-[var(--hairline)] bg-[var(--surface)] px-2.5 py-1.5 text-xs text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)]"
      />
      <div className="flex items-center justify-end gap-1.5">
        <button
          type="button"
          onClick={() => setAdding(false)}
          disabled={submitting}
          className="px-2.5 py-1 text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors cursor-pointer"
        >
          Close
        </button>
        <button
          type="submit"
          disabled={submitting || !name.trim()}
          className="flex items-center gap-1 rounded-[6px] bg-[var(--accent-blue)] px-3 py-1 text-xs font-medium text-[#0C0E11] hover:bg-[var(--accent-blue)]/90 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {submitting ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Plus className="size-3" />
          )}
          <span>Add</span>
        </button>
      </div>
    </form>
  );
}

// ── Main Board ────────────────────────────────────────────────
interface KanbanBoardProps {
  initialLeads: SerializedLead[];
}

export function KanbanBoard({ initialLeads }: KanbanBoardProps) {
  const [columns, setColumns] = useState(() => buildColumns(initialLeads));

  // Sync when server-side data changes (e.g. after revalidation)
  useEffect(() => {
    setColumns(buildColumns(initialLeads));
  }, [initialLeads]);

  // Flat lookup for quick access
  const leadById = useMemo(() => {
    const map = new Map<string, SerializedLead>();
    for (const leads of Object.values(columns)) {
      for (const l of leads) map.set(l.id, l);
    }
    return map;
  }, [columns]);

  // ── Drag commit handler ─────────────────────────────────────
  const handleCommit = async (
    newValue: Record<string, SerializedLead[]>,
    meta: KanbanCommitMeta<SerializedLead>
  ) => {
    if (meta.kind !== "item") return; // columns are not reorderable

    const leadId = meta.event.active.id as string;
    const lead = leadById.get(leadId);
    if (!lead) return;

    const fromCol = meta.activeContainer as KanbanStage;
    const toCol = meta.overContainer as KanbanStage;

    if (fromCol === toCol) return; // reorder within same column, nothing to persist

    const targetStatus = STAGES.find((s) => s.key === toCol)?.status;
    if (!targetStatus) return;

    const previousStatus = lead.status;

    // Toast
    if (targetStatus === "CONVERTED") {
      toast({
        message: `${lead.name} won and marked as CONVERTED! 🎉`,
        state: "success",
      });
    } else {
      const stageName = STAGES.find((s) => s.key === toCol)?.title || toCol;
      toast({
        message: `${lead.name} moved to ${stageName}`,
        state: "info",
      });
    }

    // Persist
    try {
      await updateLeadAction(leadId, { status: targetStatus });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Server error";
      // Rollback
      setColumns(meta.previousValue);
      toast({
        message: `Failed to move ${lead.name}: ${msg}`,
        state: "error",
      });
    }
  };

  // ── Status change from dropdown ─────────────────────────────
  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    const lead = leadById.get(leadId);
    if (!lead || lead.status === newStatus) return;

    const previousStatus = lead.status;
    const targetStage = stageForStatus(newStatus);
    if (!targetStage) return;

    // Optimistic update
    const prev = { ...columns };
    const updated: Record<string, SerializedLead[]> = {};
    for (const [key, items] of Object.entries(columns)) {
      updated[key] = items.filter((l) => l.id !== leadId);
    }
    updated[targetStage] = [{ ...lead, status: newStatus }, ...updated[targetStage]];
    setColumns(updated);

    if (newStatus === "CONVERTED") {
      toast({
        message: `${lead.name} won and marked as CONVERTED! 🎉`,
        state: "success",
      });
    } else {
      toast({
        message: `${lead.name} moved to ${newStatus.replace("_", " ")}`,
        state: "info",
      });
    }

    try {
      await updateLeadAction(leadId, { status: newStatus });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Server error";
      setColumns(prev);
      toast({
        message: `Failed to move ${lead.name}: ${msg}`,
        state: "error",
      });
    }
  };

  // ── Discard lead ────────────────────────────────────────────
  const handleDiscardLead = async (leadId: string) => {
    const lead = leadById.get(leadId);
    if (!lead) return;

    const previousStatus = lead.status;
    const prev = { ...columns };

    // Remove from board
    const updated: Record<string, SerializedLead[]> = {};
    for (const [key, items] of Object.entries(columns)) {
      updated[key] = items.filter((l) => l.id !== leadId);
    }
    setColumns(updated);

    toast({
      message: `${lead.name} discarded (moved to Lost)`,
      state: "error",
      lifetime: 6000,
      action: {
        label: "Undo",
        run: async () => {
          setColumns(prev);
          try {
            await updateLeadAction(leadId, { status: previousStatus });
            toast({
              message: `${lead.name} restored to ${previousStatus.replace("_", " ")}`,
              state: "success",
            });
          } catch (err: unknown) {
            console.error("Failed to undo discard:", err);
          }
        },
      },
    });

    try {
      await updateLeadAction(leadId, { status: LeadStatus.LOST });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Server error";
      setColumns(prev);
      toast({
        message: `Failed to discard ${lead.name}: ${msg}`,
        state: "error",
      });
    }
  };

  // ── Quick add ───────────────────────────────────────────────
  const handleQuickAdd = async (name: string, stage: KanbanStage) => {
    const targetStatus = STAGES.find((s) => s.key === stage)?.status ?? LeadStatus.NEW;

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          source: "WEBSITE",
          priority: "NORMAL",
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to create lead");
      }

      const createdLead = data.lead as SerializedLead;

      // If stage is not NEW, update status
      if (targetStatus !== LeadStatus.NEW) {
        await updateLeadAction(createdLead.id, { status: targetStatus });
        createdLead.status = targetStatus;
      }

      setColumns((prev) => ({
        ...prev,
        [stage]: [createdLead, ...prev[stage]],
      }));

      toast({
        message: `Lead added — ${createdLead.name} is now in your pipeline.`,
        state: "success",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create lead";
      toast({ message: msg, state: "error" });
      throw err;
    }
  };

  // ── Render ──────────────────────────────────────────────────
  return (
    <Kanban
      value={columns}
      onValueChange={setColumns}
      getItemValue={(item) => item.id}
      onValueCommit={handleCommit}
    >
      <ReUIKanbanBoard className="grid auto-rows-fr grid-cols-3 gap-4 min-w-max">
        {STAGES.map((stage) => {
          const items = columns[stage.key] || [];
          return (
            <KanbanColumn
              key={stage.key}
              value={stage.key}
              disabled // lock column order — no column reordering
              className="w-72 sm:w-80 shrink-0 flex flex-col h-[calc(100vh-14rem)] rounded-[12px] border border-[var(--hairline)] bg-[var(--surface)] p-3"
            >
              {/* Column Header */}
              <div className="mb-3 flex items-center justify-between px-1 pb-2 border-b border-[var(--hairline)]">
                <div className="flex items-center gap-2">
                  <span
                    className="size-2 rounded-full shrink-0"
                    style={{ backgroundColor: stage.dotColor }}
                  />
                  <h3 className={`font-sans text-[13px] font-medium tracking-tight ${stage.headingColor}`}>
                    {stage.title}
                  </h3>
                </div>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-[var(--surface-raised)] border border-[var(--hairline)] text-[var(--ink-muted)]">
                  {items.length}
                </span>
              </div>

              {/* Scrollable card area */}
              <KanbanColumnContent
                value={stage.key}
                className="flex-1 overflow-y-auto pr-1 -mr-1 flex flex-col gap-2"
              >
                {items.map((lead) => (
                  <KanbanItem key={lead.id} value={lead.id}>
                    <KanbanItemHandle className="cursor-grab active:cursor-grabbing">
                      <LeadCard
                        lead={lead}
                        column={stage.key}
                        onStatusChange={handleStatusChange}
                        onDiscardLead={handleDiscardLead}
                      />
                    </KanbanItemHandle>
                  </KanbanItem>
                ))}
              </KanbanColumnContent>

              {/* Inline quick-add */}
              <QuickAddForm stage={stage.key} onAdd={handleQuickAdd} />
            </KanbanColumn>
          );
        })}
      </ReUIKanbanBoard>

      {/* Drag overlay — shows a ghost of the card being dragged */}
      <KanbanOverlay>
        {({ value }) => {
          const lead = leadById.get(value as string);
          if (!lead) return null;
          const stage = stageForStatus(lead.status);
          return (
            <div className="w-72 sm:w-80 opacity-90 rotate-2 scale-105">
              <LeadCard
                lead={lead}
                column={stage || "NEW"}
                onStatusChange={() => {}}
                onDiscardLead={() => {}}
              />
            </div>
          );
        }}
      </KanbanOverlay>
    </Kanban>
  );
}
