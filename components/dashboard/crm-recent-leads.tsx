"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Lead } from "@prisma/client";
import { Search, Flame, ExternalLink, MessageSquare, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function formatRelative(date: Date) {
  const hrs = Math.floor((Date.now() - new Date(date).getTime()) / 36e5);
  if (hrs < 1) return "just now";
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function cleanPhoneNumber(phone?: string | null) {
  if (!phone) return "";
  return phone.replace(/[^\d+]/g, "");
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  NEW: { label: "New", color: "var(--accent-blue)", bg: "rgba(124, 156, 217, 0.12)" },
  CONTACTED: { label: "Contacted", color: "var(--attention)", bg: "rgba(232, 163, 61, 0.12)" },
  FOLLOW_UP: { label: "Follow up", color: "var(--ink-muted)", bg: "rgba(139, 144, 152, 0.12)" },
  QUALIFIED: { label: "Qualified", color: "var(--clear)", bg: "rgba(94, 200, 176, 0.12)" },
  CONVERTED: { label: "Converted", color: "var(--clear)", bg: "rgba(94, 200, 176, 0.15)" },
  LOST: { label: "Lost", color: "var(--ink-faint)", bg: "rgba(86, 92, 100, 0.15)" },
};

export function CrmRecentLeads({ leads }: { leads: Lead[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        !search ||
        lead.name.toLowerCase().includes(search.toLowerCase()) ||
        lead.phone?.toLowerCase().includes(search.toLowerCase()) ||
        lead.email?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "ALL" || lead.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [leads, search, statusFilter]);

  return (
    <div className="rounded-[12px] border border-[var(--hairline)] bg-[var(--surface)] p-6">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-4 border-b border-[var(--hairline)]">
        <div>
          <h2 className="font-heading text-[18px] font-normal text-[var(--ink)] tracking-tight">
            Recent opportunities
          </h2>
          <p className="text-[13px] font-sans text-[var(--ink-muted)] mt-0.5">
            Customer inquiries captured across website forms, WhatsApp, and ad campaigns.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-[var(--ink-faint)]" />
            <Input
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-40 pl-8 font-sans text-xs rounded-[6px] border-[var(--hairline)] bg-[var(--surface-raised)] text-[var(--ink)] placeholder:text-[var(--ink-faint)] md:w-48"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-32 font-sans text-xs rounded-[6px] border-[var(--hairline)] bg-[var(--surface-raised)] text-[var(--ink)]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent className="rounded-[8px] border-[var(--hairline)] bg-[var(--surface-raised)] text-[var(--ink)]">
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="NEW">New</SelectItem>
              <SelectItem value="CONTACTED">Contacted</SelectItem>
              <SelectItem value="FOLLOW_UP">Follow up</SelectItem>
              <SelectItem value="QUALIFIED">Qualified</SelectItem>
              <SelectItem value="CONVERTED">Converted</SelectItem>
              <SelectItem value="LOST">Lost</SelectItem>
            </SelectContent>
          </Select>

          <Link
            href="/leads"
            className="text-[13px] font-sans text-[var(--accent-blue)] hover:underline ml-1"
          >
            View all
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto pt-2">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[var(--hairline)] hover:bg-transparent">
              <TableHead className="font-sans text-[12px] font-medium text-[var(--ink-muted)] pl-0">
                Lead contact
              </TableHead>
              <TableHead className="font-sans text-[12px] font-medium text-[var(--ink-muted)]">
                Channel
              </TableHead>
              <TableHead className="font-sans text-[12px] font-medium text-[var(--ink-muted)]">
                Status
              </TableHead>
              <TableHead className="font-sans text-[12px] font-medium text-[var(--ink-muted)]">
                Captured
              </TableHead>
              <TableHead className="font-sans text-[12px] font-medium text-[var(--ink-muted)] text-right pr-0">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="h-24 text-center font-sans text-[13px] text-[var(--ink-muted)]">
                  No inquiries match the current filter.
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((lead) => {
                const status = STATUS_CONFIG[lead.status] || {
                  label: lead.status,
                  color: "var(--ink-muted)",
                  bg: "transparent",
                };
                const phoneClean = cleanPhoneNumber(lead.phone);
                const waUrl = phoneClean
                  ? `https://wa.me/${phoneClean.replace("+", "")}?text=${encodeURIComponent(
                      `Hi ${lead.name}, following up regarding your inquiry!`
                    )}`
                  : null;

                return (
                  <TableRow
                    key={lead.id}
                    className="border-b border-[var(--hairline)] hover:bg-[var(--surface-raised)]/40 transition-colors"
                  >
                    <TableCell className="py-3 pl-0">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/leads/${lead.id}`}
                            className="font-sans font-medium text-[13px] text-[var(--ink)] hover:underline"
                          >
                            {lead.name}
                          </Link>
                          {lead.priority === "HOT" && (
                            <span className="flex items-center gap-0.5 text-[11px] font-mono text-[var(--urgent)]">
                              <Flame size={10} />
                              Hot
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-[11px] text-[var(--ink-muted)]">
                          {lead.phone || lead.email || "No direct contact"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="py-3">
                      <span className="font-sans text-[12px] text-[var(--ink-muted)]">
                        {lead.source.toLowerCase().replace("_", " ")}
                      </span>
                    </TableCell>

                    <TableCell className="py-3">
                      <span
                        className="inline-flex items-center rounded-[4px] px-2 py-0.5 font-sans text-[11px] font-medium"
                        style={{ color: status.color, backgroundColor: status.bg }}
                      >
                        {status.label}
                      </span>
                    </TableCell>

                    <TableCell className="py-3 font-mono text-[12px] text-[var(--ink-muted)]">
                      {formatRelative(lead.createdAt)}
                    </TableCell>

                    <TableCell className="py-3 text-right pr-0">
                      <div className="flex items-center justify-end gap-1.5">
                        {waUrl && (
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center size-7 rounded-[4px] text-[var(--clear)] hover:bg-[var(--surface-raised)]"
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare className="size-3.5" />
                          </a>
                        )}
                        {lead.phone && (
                          <a
                            href={`tel:${lead.phone}`}
                            className="inline-flex items-center justify-center size-7 rounded-[4px] text-[var(--accent-blue)] hover:bg-[var(--surface-raised)]"
                            title="Call phone"
                          >
                            <Phone className="size-3.5" />
                          </a>
                        )}
                        <Link
                          href={`/leads/${lead.id}`}
                          className="inline-flex items-center justify-center h-7 px-2 font-sans text-[12px] text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-raised)] rounded-[4px]"
                        >
                          View
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between pt-4 text-[12px] font-sans text-[var(--ink-muted)]">
        <span>
          Viewing <strong className="font-mono text-[var(--ink)]">{filteredLeads.length}</strong> of{" "}
          <strong className="font-mono text-[var(--ink)]">{leads.length}</strong> inquiries
        </span>
        <Link
          href="/leads"
          className="text-[var(--accent-blue)] hover:underline font-medium"
        >
          Open lead registry →
        </Link>
      </div>
    </div>
  );
}
