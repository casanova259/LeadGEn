"use client";

import React, { useState, DragEvent, FormEvent } from "react";
import { motion } from "motion/react";
import { LeadStatus } from "@prisma/client";
import { SerializedLead } from "@/components/shared/inline-lead-row";
import { KanbanCard, DropIndicator, KanbanStage } from "./kanban-card";
import { Plus, Loader2 } from "lucide-react";

interface KanbanColumnProps {
  stage: KanbanStage;
  title: string;
  headingColor: string;
  dotColor: string;
  leads: SerializedLead[];
  onDropLead: (cardId: string, targetStage: KanbanStage, beforeId: string) => void;
  onStatusChange: (leadId: string, newStatus: LeadStatus) => void;
  onDiscardLead: (leadId: string) => void;
  onQuickAddLead: (name: string, stage: KanbanStage) => Promise<void>;
}

export function KanbanColumn({
  stage,
  title,
  headingColor,
  dotColor,
  leads,
  onDropLead,
  onStatusChange,
  onDiscardLead,
  onQuickAddLead,
}: KanbanColumnProps) {
  const [active, setActive] = useState(false);
  const [adding, setAdding] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDragStart = (e: DragEvent<HTMLDivElement>, cardId: string) => {
    e.dataTransfer.setData("cardId", cardId);
    e.dataTransfer.setData("fromColumn", stage);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    highlightIndicator(e);
    setActive(true);
  };

  const handleDragLeave = () => {
    clearHighlights();
    setActive(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData("cardId");

    setActive(false);
    clearHighlights();

    const indicators = getIndicators();
    const { element } = getNearestIndicator(e, indicators);

    const before = element.dataset.before || "-1";

    if (cardId && before !== cardId) {
      onDropLead(cardId, stage, before);
    }
  };

  const clearHighlights = (els?: HTMLElement[]) => {
    const indicators = els || getIndicators();
    indicators.forEach((i) => {
      i.style.opacity = "0";
    });
  };

  const highlightIndicator = (e: DragEvent<HTMLDivElement>) => {
    const indicators = getIndicators();
    clearHighlights(indicators);

    const el = getNearestIndicator(e, indicators);
    if (el.element) {
      el.element.style.opacity = "1";
    }
  };

  const getNearestIndicator = (
    e: DragEvent<HTMLDivElement>,
    indicators: HTMLElement[]
  ) => {
    const DISTANCE_OFFSET = 50;

    const el = indicators.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = e.clientY - (box.top + DISTANCE_OFFSET);

        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      {
        offset: Number.NEGATIVE_INFINITY,
        element: indicators[indicators.length - 1],
      }
    );

    return el;
  };

  const getIndicators = () => {
    return Array.from(
      document.querySelectorAll(
        `[data-column="${stage}"]`
      ) as unknown as HTMLElement[]
    );
  };

  const handleQuickAdd = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = leadName.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    try {
      await onQuickAddLead(trimmed, stage);
      setLeadName("");
      setAdding(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-72 sm:w-80 shrink-0 flex flex-col h-[calc(100vh-14rem)] rounded-[12px] border border-[var(--hairline)] bg-[var(--surface)] p-3">
      {/* Column Header */}
      <div className="mb-3 flex items-center justify-between px-1 pb-2 border-b border-[var(--hairline)]">
        <div className="flex items-center gap-2">
          <span
            className="size-2 rounded-full shrink-0"
            style={{ backgroundColor: dotColor }}
          />
          <h3 className={`font-sans text-[13px] font-medium tracking-tight ${headingColor}`}>
            {title}
          </h3>
        </div>
        <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-[var(--surface-raised)] border border-[var(--hairline)] text-[var(--ink-muted)]">
          {leads.length}
        </span>
      </div>

      {/* Cards & Drop Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`flex-1 overflow-y-auto pr-1 -mr-1 transition-colors rounded-[8px] ${
          active ? "bg-[var(--surface-raised)]/35" : "bg-transparent"
        }`}
      >
        {leads.map((c) => (
          <KanbanCard
            key={c.id}
            lead={c}
            column={stage}
            onStatusChange={onStatusChange}
            onDiscardLead={onDiscardLead}
            handleDragStart={handleDragStart}
          />
        ))}

        <DropIndicator beforeId={null} column={stage} />

        {/* Inline Add Card */}
        {adding ? (
          <motion.form
            layout
            onSubmit={handleQuickAdd}
            className="mt-2 rounded-[8px] border border-[var(--hairline)] bg-[var(--surface-raised)] p-2.5 shadow-sm space-y-2"
          >
            <input
              type="text"
              value={leadName}
              onChange={(e) => setLeadName(e.target.value)}
              autoFocus
              placeholder="Lead full name..."
              disabled={isSubmitting}
              className="w-full rounded-[6px] border border-[var(--hairline)] bg-[var(--surface)] px-2.5 py-1.5 text-xs text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)]"
            />
            <div className="flex items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setAdding(false)}
                disabled={isSubmitting}
                className="px-2.5 py-1 text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !leadName.trim()}
                className="flex items-center gap-1 rounded-[6px] bg-[var(--accent-blue)] px-3 py-1 text-xs font-medium text-[#0C0E11] hover:bg-[var(--accent-blue)]/90 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Plus className="size-3" />
                )}
                <span>Add</span>
              </button>
            </div>
          </motion.form>
        ) : (
          <motion.button
            layout
            type="button"
            onClick={() => setAdding(true)}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-[8px] border border-dashed border-[var(--hairline)]/80 py-2 text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] hover:border-[var(--hairline)] hover:bg-[var(--surface-raised)]/30 transition-all cursor-pointer"
          >
            <Plus className="size-3.5" />
            <span>Add card</span>
          </motion.button>
        )}
      </div>
    </div>
  );
}
