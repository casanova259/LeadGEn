"use client";

import React, { useState, useEffect } from "react";
import { LeadStatus } from "@prisma/client";
import { SerializedLead } from "@/components/shared/inline-lead-row";
import { KanbanColumn } from "./kanban-column";
import { BurnBarrel } from "./burn-barrel";
import { KanbanStage } from "./kanban-card";
import { updateLeadAction } from "@/src/server/actions/lead.actions";
import { toast } from "@/components/ui/toast";

const STAGE_CONFIG: {
  stage: KanbanStage;
  title: string;
  dotColor: string;
  headingColor: string;
  status: LeadStatus;
}[] = [
  {
    stage: "new",
    title: "New",
    dotColor: "var(--accent-blue)",
    headingColor: "text-[var(--accent-blue)]",
    status: LeadStatus.NEW,
  },
  {
    stage: "followed_up",
    title: "Followed Up",
    dotColor: "var(--attention)",
    headingColor: "text-[var(--attention)]",
    status: LeadStatus.FOLLOW_UP,
  },
  {
    stage: "converted",
    title: "Converted 🎉",
    dotColor: "var(--clear)",
    headingColor: "text-[var(--clear)]",
    status: LeadStatus.CONVERTED,
  },
];

function getStageForStatus(status: LeadStatus): KanbanStage | null {
  if (status === "NEW") return "new";
  if (status === "CONVERTED") return "converted";
  if (status === "LOST") return null; // Discarded
  return "followed_up"; // CONTACTED, FOLLOW_UP, QUALIFIED all map to followed_up
}

interface KanbanBoardProps {
  initialLeads: SerializedLead[];
}

export function KanbanBoard({ initialLeads }: KanbanBoardProps) {
  const [leads, setLeads] = useState<SerializedLead[]>(initialLeads);

  useEffect(() => {
    setLeads(initialLeads);
  }, [initialLeads]);

  // Handle reordering or cross-column drops with beforeId
  const handleDropLead = async (
    cardId: string,
    targetStage: KanbanStage,
    beforeId: string
  ) => {
    const cardToTransfer = leads.find((c) => c.id === cardId);
    if (!cardToTransfer) return;

    const previousStatus = cardToTransfer.status;
    const targetStatus =
      targetStage === "new"
        ? LeadStatus.NEW
        : targetStage === "converted"
        ? LeadStatus.CONVERTED
        : LeadStatus.FOLLOW_UP;

    const statusChanged = cardToTransfer.status !== targetStatus;

    // 1. Optimistic reorder
    const copy = [...leads];
    const itemIndex = copy.findIndex((c) => c.id === cardId);
    if (itemIndex === -1) return;

    const updatedCard: SerializedLead = {
      ...cardToTransfer,
      status: targetStatus,
    };

    copy.splice(itemIndex, 1);

    if (beforeId === "-1") {
      copy.push(updatedCard);
    } else {
      const insertIndex = copy.findIndex((el) => el.id === beforeId);
      if (insertIndex === -1) {
        copy.push(updatedCard);
      } else {
        copy.splice(insertIndex, 0, updatedCard);
      }
    }

    setLeads(copy);

    // 2. Toast feedback if status changed
    if (statusChanged) {
      if (targetStatus === "CONVERTED") {
        toast({
          message: `${cardToTransfer.name} won and marked as CONVERTED! 🎉`,
          state: "success",
        });
      } else {
        const stageName =
          STAGE_CONFIG.find((s) => s.stage === targetStage)?.title || targetStage;
        toast({
          message: `${cardToTransfer.name} moved to ${stageName}`,
          state: "info",
        });
      }
    }

    // 3. Persist to server in background
    if (statusChanged) {
      try {
        await updateLeadAction(cardId, { status: targetStatus });
      } catch (err: any) {
        console.error("Failed to update status:", err);
        // Rollback on failure
        setLeads((prev) =>
          prev.map((l) => (l.id === cardId ? { ...l, status: previousStatus } : l))
        );
        toast({
          message: `Failed to move ${cardToTransfer.name}: ${err?.message || "Server error"}`,
          state: "error",
        });
      }
    }
  };

  // Direct status change from dropdown menu
  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    const currentLead = leads.find((l) => l.id === leadId);
    if (!currentLead || currentLead.status === newStatus) return;

    const previousStatus = currentLead.status;

    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    );

    if (newStatus === "CONVERTED") {
      toast({
        message: `${currentLead.name} won and marked as CONVERTED! 🎉`,
        state: "success",
      });
    } else {
      toast({
        message: `${currentLead.name} moved to ${newStatus.replace("_", " ")}`,
        state: "info",
      });
    }

    try {
      await updateLeadAction(leadId, { status: newStatus });
    } catch (err: any) {
      console.error("Failed to update status:", err);
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: previousStatus } : l))
      );
      toast({
        message: `Failed to move ${currentLead.name}: ${err?.message || "Server error"}`,
        state: "error",
      });
    }
  };

  // Burn barrel discard action
  const handleDiscardLead = async (leadId: string) => {
    const currentLead = leads.find((l) => l.id === leadId);
    if (!currentLead) return;

    const previousStatus = currentLead.status;

    // Remove from active board
    setLeads((prev) => prev.filter((l) => l.id !== leadId));

    // Toast with Undo action!
    toast({
      message: `${currentLead.name} discarded (moved to Lost)`,
      state: "error",
      lifetime: 6000,
      action: {
        label: "Undo",
        run: async () => {
          // Restore lead
          setLeads((prev) => [currentLead, ...prev]);
          try {
            await updateLeadAction(leadId, { status: previousStatus });
            toast({
              message: `${currentLead.name} restored to ${previousStatus.replace("_", " ")}`,
              state: "success",
            });
          } catch (err: any) {
            console.error("Failed to undo discard:", err);
          }
        },
      },
    });

    try {
      await updateLeadAction(leadId, { status: LeadStatus.LOST });
    } catch (err: any) {
      console.error("Failed to discard lead:", err);
      setLeads((prev) => [currentLead, ...prev]);
      toast({
        message: `Failed to discard ${currentLead.name}: ${err?.message || "Server error"}`,
        state: "error",
      });
    }
  };

  // Inline Quick Add Card inside column
  const handleQuickAddLead = async (name: string, stage: KanbanStage) => {
    const targetStatus =
      stage === "new"
        ? LeadStatus.NEW
        : stage === "converted"
        ? LeadStatus.CONVERTED
        : LeadStatus.FOLLOW_UP;

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

      const createdLead = data.lead;

      // If stage is not NEW, update status to target status
      if (targetStatus !== LeadStatus.NEW) {
        await updateLeadAction(createdLead.id, { status: targetStatus });
        createdLead.status = targetStatus;
      }

      setLeads((prev) => [createdLead, ...prev]);

      toast({
        message: `Lead added — ${createdLead.name} is now in your pipeline.`,
        state: "success",
      });
    } catch (err: any) {
      console.error("Failed to quick add lead:", err);
      toast({
        message: err?.message || "Failed to create lead",
        state: "error",
      });
      throw err;
    }
  };

  return (
    <div className="w-full overflow-x-auto pb-6 scrollbar-thin">
      <div className="flex gap-4 min-w-max items-start pb-2">
        {STAGE_CONFIG.map((col) => {
          const columnLeads = leads.filter((l) => {
            const mappedStage = getStageForStatus(l.status);
            return mappedStage === col.stage;
          });

          return (
            <KanbanColumn
              key={col.stage}
              stage={col.stage}
              title={col.title}
              dotColor={col.dotColor}
              headingColor={col.headingColor}
              leads={columnLeads}
              onDropLead={handleDropLead}
              onStatusChange={handleStatusChange}
              onDiscardLead={handleDiscardLead}
              onQuickAddLead={handleQuickAddLead}
            />
          );
        })}

        {/* Burn Barrel Discard Target */}
        <BurnBarrel onDiscardLead={handleDiscardLead} />
      </div>
    </div>
  );
}
