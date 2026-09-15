"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { LeadStatus } from "@prisma/client";
import { SerializedLead } from "@/components/shared/inline-lead-row";
import {
  Flame,
  Phone,
  Mail,
  FileText,
  MessageSquare,
  MoreVertical,
  ArrowRight,
  GripVertical,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export type KanbanStage = "new" | "followed_up" | "converted";

export interface DropIndicatorProps {
  beforeId: string | null;
  column: string;
}

export function DropIndicator({ beforeId, column }: DropIndicatorProps) {
  return (
    <div
      data-before={beforeId || "-1"}
      data-column={column}
      className="my-1 h-1 w-full rounded-full bg-[var(--accent-blue)] opacity-0 transition-opacity duration-150 shadow-[0_0_8px_var(--accent-blue)]"
    />
  );
}

function formatRelative(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  const hrs = Math.floor((Date.now() - d.getTime()) / 36e5);
  if (hrs < 1) return "just now";
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function cleanPhoneNumber(phone?: string | null) {
  if (!phone) return "";
  return phone.replace(/[^\d+]/g, "");
}

interface KanbanCardProps {
  lead: SerializedLead;
  column: KanbanStage;
  onStatusChange: (leadId: string, newStatus: LeadStatus) => void;
  onDiscardLead?: (leadId: string) => void;
  handleDragStart: (e: React.DragEvent<HTMLDivElement>, cardId: string) => void;
}

export function KanbanCard({
  lead,
  column,
  onStatusChange,
  onDiscardLead,
  handleDragStart,
}: KanbanCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const cleanPhone = cleanPhoneNumber(lead.phone);
  const waLink = cleanPhone
    ? `https://wa.me/${cleanPhone.replace("+", "")}?text=${encodeURIComponent(
        `Hi ${lead.name}, thanks for reaching out to us! How can I help you today?`
      )}`
    : null;

  const onDragStartHandler = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(true);
    e.dataTransfer.setData("cardId", lead.id);
    e.dataTransfer.setData("fromColumn", column);
    handleDragStart(e, lead.id);
  };

  const onDragEndHandler = () => {
    setIsDragging(false);
  };

  return (
    <>
      <DropIndicator beforeId={lead.id} column={column} />
      <motion.div layout layoutId={lead.id}>
        <div
          id={`kanban-lead-${lead.id}`}
          draggable="true"
          onDragStart={onDragStartHandler}
          onDragEnd={onDragEndHandler}
          className={`group relative rounded-[10px] border border-[var(--hairline)] bg-[var(--surface-raised)] p-3.5 shadow-xs hover:border-[var(--accent-blue)]/60 hover:shadow-md transition-all cursor-grab active:cursor-grabbing select-none ${
            isDragging
              ? "opacity-35 scale-[0.98] border-dashed border-[var(--accent-blue)]"
              : ""
          }`}
        >
        {/* Top Header: Name + Priority + Action Menu */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link
                href={`/leads/${lead.id}`}
                onClick={(e) => e.stopPropagation()}
                className="font-medium text-[13px] text-[var(--ink)] truncate hover:underline hover:text-[var(--accent-blue)] transition-colors"
              >
                {lead.name}
              </Link>

              {lead.priority === "HOT" && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-red-500/10 border border-red-500/20 px-1.5 py-0.2 text-[9px] font-semibold text-red-400">
                  <Flame size={9} />
                  HOT
                </span>
              )}
            </div>

            <p className="text-[11px] text-[var(--ink-faint)] font-mono mt-0.5">
              {formatRelative(lead.createdAt)} · {lead.source.replace("_", " ")}
            </p>
          </div>

          {/* Quick Action Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-6 text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-white/5 opacity-70 group-hover:opacity-100 transition-opacity -mr-1"
              >
                <MoreVertical className="size-3.5" />
                <span className="sr-only">Lead actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-44 bg-[var(--surface-raised)] border-[var(--hairline)] text-[var(--ink)]"
            >
              <DropdownMenuLabel className="text-[11px] text-[var(--ink-muted)] uppercase tracking-wider">
                Move to stage
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[var(--hairline)]" />
              <DropdownMenuItem
                disabled={column === "new"}
                onClick={() => onStatusChange(lead.id, LeadStatus.NEW)}
                className="text-xs flex items-center justify-between cursor-pointer focus:bg-[var(--surface)] focus:text-[var(--ink)]"
              >
                <span>New</span>
                {column === "new" ? (
                  <span className="text-[10px] text-[var(--ink-faint)] font-mono">current</span>
                ) : (
                  <ArrowRight className="size-3 text-[var(--ink-faint)]" />
                )}
              </DropdownMenuItem>

              <DropdownMenuItem
                disabled={column === "followed_up"}
                onClick={() => onStatusChange(lead.id, LeadStatus.FOLLOW_UP)}
                className="text-xs flex items-center justify-between cursor-pointer focus:bg-[var(--surface)] focus:text-[var(--ink)]"
              >
                <span>Followed Up</span>
                {column === "followed_up" ? (
                  <span className="text-[10px] text-[var(--ink-faint)] font-mono">current</span>
                ) : (
                  <ArrowRight className="size-3 text-[var(--ink-faint)]" />
                )}
              </DropdownMenuItem>

              <DropdownMenuItem
                disabled={column === "converted"}
                onClick={() => onStatusChange(lead.id, LeadStatus.CONVERTED)}
                className="text-xs flex items-center justify-between cursor-pointer focus:bg-[var(--surface)] focus:text-[var(--ink)]"
              >
                <span>Converted 🎉</span>
                {column === "converted" ? (
                  <span className="text-[10px] text-[var(--ink-faint)] font-mono">current</span>
                ) : (
                  <ArrowRight className="size-3 text-[var(--ink-faint)]" />
                )}
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-[var(--hairline)]" />

              {onDiscardLead && (
                <DropdownMenuItem
                  onClick={() => onDiscardLead(lead.id)}
                  className="text-xs text-[var(--urgent)] flex items-center gap-1.5 cursor-pointer focus:bg-red-500/10 focus:text-[var(--urgent)]"
                >
                  <Trash2 className="size-3 text-[var(--urgent)]" />
                  <span>Discard (Move to Lost)</span>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator className="bg-[var(--hairline)]" />
              <DropdownMenuItem asChild className="text-xs cursor-pointer focus:bg-[var(--surface)]">
                <Link href={`/leads/${lead.id}`}>View full details</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Contact Snippets */}
        <div className="mt-2.5 space-y-1 text-xs text-[var(--ink-muted)]">
          {lead.phone && (
            <div className="flex items-center gap-1.5 truncate">
              <Phone size={11} className="shrink-0 text-[var(--ink-faint)]" />
              <span className="truncate font-mono text-[11px]">{lead.phone}</span>
            </div>
          )}
          {lead.email && (
            <div className="flex items-center gap-1.5 truncate">
              <Mail size={11} className="shrink-0 text-[var(--ink-faint)]" />
              <span className="truncate text-[11px]">{lead.email}</span>
            </div>
          )}
          {lead.notes && (
            <div className="flex items-start gap-1.5 mt-1 pt-1 border-t border-[var(--hairline)]/60 text-[11px] text-[var(--ink-muted)] line-clamp-2 italic">
              <FileText size={11} className="shrink-0 mt-0.5 text-[var(--ink-faint)]" />
              <span>{lead.notes}</span>
            </div>
          )}
        </div>

        {/* 1-Click Quick Actions Footer */}
        {(cleanPhone || lead.email) && (
          <div className="mt-3 pt-2.5 border-t border-[var(--hairline)] flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5">
              {waLink && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  title="Send WhatsApp message"
                  className="inline-flex items-center gap-1 rounded-[6px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-medium transition"
                >
                  <MessageSquare size={10} />
                  WhatsApp
                </a>
              )}
              {cleanPhone && (
                <a
                  href={`tel:${cleanPhone}`}
                  onClick={(e) => e.stopPropagation()}
                  title="Call lead"
                  className="inline-flex items-center gap-1 rounded-[6px] bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 px-2 py-0.5 text-[10px] font-medium transition"
                >
                  <Phone size={10} />
                  Call
                </a>
              )}
            </div>

            <span className="text-[10px] text-[var(--ink-faint)] flex items-center gap-0.5 font-mono">
              <GripVertical size={10} className="text-[var(--ink-faint)]/50" />
              Drag
            </span>
          </div>
        )}
        </div>
      </motion.div>
    </>
  );
}
