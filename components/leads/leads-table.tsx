"use client";

import { useEffect, useState, useTransition, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LeadStatus, LeadPriority, LeadSource } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditLeadDialog } from "./edit-lead-dialog";
import { updateLeadAction, deleteLeadAction } from "@/src/server/actions/lead.actions";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import {
  Flame,
  Phone,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Trash2,
  ExternalLink,
  ChevronDown,
  Globe,
  Share2,
} from "lucide-react";

export type SerializedLead = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  source: LeadSource;
  status: LeadStatus;
  priority: LeadPriority;
  notes: string | null;
  createdAt: Date | string;
};

const STATUS_CONFIG: Record<
  LeadStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  NEW: {
    label: "New",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
  },
  CONTACTED: {
    label: "Contacted",
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/20",
  },
  FOLLOW_UP: {
    label: "Follow Up",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
  },
  QUALIFIED: {
    label: "Qualified",
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    border: "border-cyan-500/20",
  },
  CONVERTED: {
    label: "Converted",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
  },
  LOST: {
    label: "Lost",
    bg: "bg-zinc-500/10",
    text: "text-zinc-400",
    border: "border-zinc-500/20",
  },
};

const SOURCE_LABELS: Record<LeadSource, string> = {
  WEBSITE: "Website",
  WHATSAPP: "WhatsApp",
  PHONE: "Phone Call",
  WALK_IN: "Walk-in",
  FACEBOOK_ADS: "Meta Ads",
  INSTAGRAM_ADS: "Instagram",
  GOOGLE_ADS: "Google Ads",
  OTHER: "Other",
};

function formatRelativeTime(dateInput: Date | string) {
  const date = new Date(dateInput);
  const diffHours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return (name[0] || "?").toUpperCase();
}

function cleanPhone(phone?: string | null) {
  if (!phone) return "";
  return phone.replace(/[^\d+]/g, "");
}

export function LeadsTable({
  leads,
  highlightId,
}: {
  leads: SerializedLead[];
  highlightId?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(null);
  const [editingLead, setEditingLead] = useState<SerializedLead | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const refreshedRef = useRef(false);

  const targetId = highlightId || searchParams.get("created") || undefined;

  useEffect(() => {
    if (!targetId) return;

    const isTargetPresent = leads.some((lead) => lead.id === targetId);
    if (!isTargetPresent) {
      if (!refreshedRef.current) {
        refreshedRef.current = true;
        router.refresh();
      }
      return;
    }

    setActiveHighlightId(targetId);
    const scrollTimer = setTimeout(() => {
      const el = document.getElementById(`lead-row-${targetId}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 50);

    const clearTimer = setTimeout(() => {
      setActiveHighlightId(null);
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        if (url.searchParams.has("created")) {
          url.searchParams.delete("created");
          const cleanUrl = url.pathname + (url.search ? url.search : "");
          window.history.replaceState(null, "", cleanUrl);
        }
      }
    }, 2000);

    return () => {
      clearTimeout(scrollTimer);
      clearTimeout(clearTimer);
    };
  }, [targetId, leads, router]);

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    startTransition(async () => {
      try {
        await updateLeadAction(leadId, { status: newStatus });
        toast({
          message: `Stage updated to ${STATUS_CONFIG[newStatus].label}`,
          state: "success",
        });
        router.refresh();
      } catch (err: any) {
        toast({
          message: `Could not update status: ${err?.message || "Error"}`,
          state: "error",
        });
      }
    });
  };

  const handleDelete = async (lead: SerializedLead) => {
    if (!confirm(`Are you sure you want to delete "${lead.name}"?`)) return;

    setDeletingId(lead.id);
    startTransition(async () => {
      try {
        await deleteLeadAction(lead.id);
        toast({
          message: `Lead "${lead.name}" deleted`,
          state: "success",
        });
        router.refresh();
      } catch (err: any) {
        toast({
          message: `Delete failed: ${err?.message || "Error"}`,
          state: "error",
        });
      } finally {
        setDeletingId(null);
      }
    });
  };

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[12px] border border-[var(--hairline)] bg-[var(--surface)] p-12 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-[var(--surface-raised)] border border-[var(--hairline)] text-[var(--ink-muted)] mb-3">
          <Share2 size={20} />
        </div>
        <h3 className="font-heading text-lg font-normal text-[var(--ink)]">
          No leads found
        </h3>
        <p className="text-xs text-[var(--ink-muted)] max-w-sm mt-1 mb-4 font-sans">
          No contacts match the current search or filters. Try adjusting your parameters or add a new lead.
        </p>
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline" className="text-xs">
            <Link href="/leads">Reset Filters</Link>
          </Button>
          <Button asChild size="sm" className="text-xs bg-[var(--accent-blue)] text-[#0C0E11] hover:bg-[var(--accent-blue)]/90">
            <Link href="/leads/new">+ New Lead</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-[12px] border border-[var(--hairline)] bg-[var(--surface)] overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-[var(--surface-raised)]/60 border-b border-[var(--hairline)]">
            <TableRow className="border-b border-[var(--hairline)] hover:bg-transparent">
              <TableHead className="w-[280px] text-xs font-medium text-[var(--ink-muted)] py-3 pl-4">
                Lead
              </TableHead>
              <TableHead className="text-xs font-medium text-[var(--ink-muted)] py-3">
                Contact Info
              </TableHead>
              <TableHead className="text-xs font-medium text-[var(--ink-muted)] py-3">
                Pipeline Stage
              </TableHead>
              <TableHead className="text-xs font-medium text-[var(--ink-muted)] py-3 hidden md:table-cell">
                Source
              </TableHead>
              <TableHead className="text-xs font-medium text-[var(--ink-muted)] py-3 hidden lg:table-cell">
                Notes
              </TableHead>
              <TableHead className="text-xs font-medium text-[var(--ink-muted)] py-3">
                Added
              </TableHead>
              <TableHead className="text-right text-xs font-medium text-[var(--ink-muted)] py-3 pr-4">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-[var(--hairline)]">
            {leads.map((lead) => {
              const statusCfg = STATUS_CONFIG[lead.status] || STATUS_CONFIG.NEW;
              const isHighlighted = lead.id === activeHighlightId;
              const phoneClean = cleanPhone(lead.phone);

              return (
                <TableRow
                  key={lead.id}
                  id={`lead-row-${lead.id}`}
                  className={cn(
                    "group transition-colors border-b border-[var(--hairline)] hover:bg-[var(--surface-raised)]/40",
                    isHighlighted && "animate-lead-highlight",
                    deletingId === lead.id && "opacity-40 pointer-events-none"
                  )}
                >
                  {/* 1. Lead Name & Priority */}
                  <TableCell className="py-3 pl-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--surface-raised)] border border-[var(--hairline)] font-mono text-xs font-medium text-[var(--ink)]">
                        {getInitials(lead.name)}
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Link
                            href={`/leads/${lead.id}`}
                            className="font-medium text-sm text-[var(--ink)] hover:underline truncate"
                          >
                            {lead.name}
                          </Link>
                          {lead.priority === "HOT" && (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-red-500/10 border border-red-500/25 px-1.5 py-0.2 font-mono text-[10px] font-semibold text-red-400">
                              <Flame size={10} className="text-red-400 shrink-0" />
                              HOT
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-mono text-[var(--ink-faint)] truncate">
                          ID: {lead.id.slice(-6)}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* 2. Contact info (Phone & Email) */}
                  <TableCell className="py-3">
                    <div className="space-y-1 text-xs">
                      {lead.phone ? (
                        <div className="flex items-center gap-1.5 font-mono text-[var(--ink)]">
                          <Phone size={12} className="text-[var(--ink-muted)] shrink-0" />
                          <a
                            href={`tel:${phoneClean}`}
                            className="hover:underline text-[var(--ink)]"
                            title="Call phone"
                          >
                            {lead.phone}
                          </a>
                        </div>
                      ) : null}

                      {lead.email ? (
                        <div className="flex items-center gap-1.5 text-[var(--ink-muted)]">
                          <Mail size={12} className="text-[var(--ink-muted)] shrink-0" />
                          <a
                            href={`mailto:${lead.email}`}
                            className="hover:underline truncate max-w-[180px]"
                            title="Send email"
                          >
                            {lead.email}
                          </a>
                        </div>
                      ) : null}

                      {!lead.phone && !lead.email && (
                        <span className="text-xs text-[var(--ink-faint)] italic">
                          No contact info
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* 3. Pipeline Stage with Quick Dropdown */}
                  <TableCell className="py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-tight transition-all hover:opacity-85 focus-visible:outline-hidden",
                            statusCfg.bg,
                            statusCfg.text,
                            statusCfg.border
                          )}
                        >
                          <span>{statusCfg.label}</span>
                          <ChevronDown size={11} className="opacity-70" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        className="w-40 bg-[var(--surface-raised)] border-[var(--hairline)] text-[var(--ink)]"
                      >
                        <DropdownMenuLabel className="text-[10px] font-medium uppercase text-[var(--ink-muted)]">
                          Update Stage
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-[var(--hairline)]" />
                        {(Object.keys(STATUS_CONFIG) as LeadStatus[]).map((st) => (
                          <DropdownMenuItem
                            key={st}
                            onClick={() => handleStatusChange(lead.id, st)}
                            className="text-xs cursor-pointer flex items-center justify-between"
                          >
                            <span>{STATUS_CONFIG[st].label}</span>
                            {lead.status === st && (
                              <span className="text-[10px] text-[var(--accent-blue)]">
                                ✓
                              </span>
                            )}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>

                  {/* 4. Source */}
                  <TableCell className="py-3 hidden md:table-cell">
                    <span className="inline-flex items-center gap-1 text-xs text-[var(--ink-muted)]">
                      <Globe size={11} className="text-[var(--ink-faint)] shrink-0" />
                      {SOURCE_LABELS[lead.source] || lead.source}
                    </span>
                  </TableCell>

                  {/* 5. Notes preview */}
                  <TableCell className="py-3 hidden lg:table-cell max-w-[220px]">
                    {lead.notes ? (
                      <p
                        className="text-xs text-[var(--ink-muted)] truncate"
                        title={lead.notes}
                      >
                        {lead.notes}
                      </p>
                    ) : (
                      <span className="text-xs text-[var(--ink-faint)]">—</span>
                    )}
                  </TableCell>

                  {/* 6. Relative Time Added */}
                  <TableCell className="py-3 text-xs text-[var(--ink-muted)] whitespace-nowrap">
                    {formatRelativeTime(lead.createdAt)}
                  </TableCell>

                  {/* 7. Quick Row Actions */}
                  <TableCell className="py-3 pr-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {lead.phone && (
                        <>
                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="size-7 rounded-[6px] text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                            title="Chat on WhatsApp"
                          >
                            <a
                              href={`https://wa.me/${phoneClean.replace(/\+/g, "")}?text=${encodeURIComponent(
                                `Hi ${lead.name}, thank you for reaching out to us!`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <MessageSquare size={13} />
                            </a>
                          </Button>

                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="size-7 rounded-[6px] text-[var(--accent-blue)] hover:bg-[var(--accent-blue)]/10"
                            title="Call contact"
                          >
                            <a href={`tel:${phoneClean}`}>
                              <Phone size={13} />
                            </a>
                          </Button>
                        </>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 rounded-[6px] text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-raised)]"
                          >
                            <MoreHorizontal size={14} />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-44 bg-[var(--surface-raised)] border-[var(--hairline)] text-[var(--ink)]"
                        >
                          <DropdownMenuItem asChild className="text-xs cursor-pointer">
                            <Link href={`/leads/${lead.id}`}>
                              <ExternalLink size={12} className="mr-2" />
                              View 360 Profile
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingLead(lead);
                              setEditOpen(true);
                            }}
                            className="text-xs cursor-pointer"
                          >
                            <Pencil size={12} className="mr-2" />
                            Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-[var(--hairline)]" />
                          <DropdownMenuItem
                            onClick={() => handleDelete(lead)}
                            className="text-xs cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-500/10"
                          >
                            <Trash2 size={12} className="mr-2" />
                            Delete Lead
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <EditLeadDialog
        lead={editingLead}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  );
}
