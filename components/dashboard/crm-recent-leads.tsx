"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Lead } from "@prisma/client";
import { Search, ArrowRight, Flame, ExternalLink, MessageSquare, Phone } from "lucide-react";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  NEW: { label: "New", className: "border-blue-500/30 bg-blue-500/10 text-blue-400" },
  CONTACTED: { label: "Contacted", className: "border-amber-500/30 bg-amber-500/10 text-amber-400" },
  FOLLOW_UP: { label: "Follow Up", className: "border-purple-500/30 bg-purple-500/10 text-purple-400" },
  QUALIFIED: { label: "Qualified", className: "border-indigo-500/30 bg-indigo-500/10 text-indigo-400" },
  CONVERTED: { label: "Converted 🎉", className: "border-emerald-500/30 bg-emerald-500/15 text-emerald-400 font-medium" },
  LOST: { label: "Lost", className: "border-zinc-500/30 bg-zinc-500/10 text-zinc-400" },
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
    <Card className="xl:col-span-12">
      <CardHeader>
        <div>
          <CardTitle>Recent Inbound Opportunities</CardTitle>
          <CardDescription>
            Live stream of customer inquiries captured across your forms, WhatsApp, and campaigns.
          </CardDescription>
        </div>

        <CardAction>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Filter by name, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 w-44 pl-8 text-xs md:w-56"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 w-32 text-xs">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="NEW">New</SelectItem>
                <SelectItem value="CONTACTED">Contacted</SelectItem>
                <SelectItem value="FOLLOW_UP">Follow Up</SelectItem>
                <SelectItem value="QUALIFIED">Qualified</SelectItem>
                <SelectItem value="CONVERTED">Converted</SelectItem>
                <SelectItem value="LOST">Lost</SelectItem>
              </SelectContent>
            </Select>

            <Button asChild size="sm" variant="outline" className="h-8 text-xs gap-1">
              <Link href="/leads">
                View All
                <ArrowRight className="size-3" />
              </Link>
            </Button>
          </div>
        </CardAction>
      </CardHeader>

      <CardContent className="px-0 pb-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="pl-6 text-xs font-semibold">Lead Contact</TableHead>
                <TableHead className="text-xs font-semibold">Channel Source</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
                <TableHead className="text-xs font-semibold">Priority</TableHead>
                <TableHead className="text-xs font-semibold">Captured</TableHead>
                <TableHead className="pr-6 text-right text-xs font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-28 text-center text-xs text-muted-foreground">
                    No leads found matching your search.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeads.map((lead) => {
                  const statusInfo = STATUS_BADGES[lead.status] || {
                    label: lead.status,
                    className: "border-border bg-muted text-muted-foreground",
                  };
                  const phoneClean = cleanPhoneNumber(lead.phone);
                  const waUrl = phoneClean
                    ? `https://wa.me/${phoneClean.replace("+", "")}?text=${encodeURIComponent(
                        `Hi ${lead.name}, following up regarding your inquiry!`
                      )}`
                    : null;

                  return (
                    <TableRow key={lead.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="pl-6 py-3 font-medium">
                        <div className="flex flex-col">
                          <Link
                            href={`/leads/${lead.id}`}
                            className="text-foreground hover:underline font-semibold text-sm flex items-center gap-1.5"
                          >
                            {lead.name}
                            <ExternalLink className="size-3 text-muted-foreground opacity-70" />
                          </Link>
                          <span className="text-xs text-muted-foreground font-normal">
                            {lead.phone || lead.email || "No contact info"}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="py-3">
                        <Badge variant="outline" className="text-[11px] uppercase tracking-wide">
                          {lead.source.replace("_", " ")}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-3">
                        <Badge variant="outline" className={`text-[11px] ${statusInfo.className}`}>
                          {statusInfo.label}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-3">
                        {lead.priority === "HOT" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[11px] font-semibold text-red-400">
                            <Flame size={11} />
                            HOT
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Normal</span>
                        )}
                      </TableCell>

                      <TableCell className="py-3 text-xs text-muted-foreground">
                        {formatRelative(lead.createdAt)}
                      </TableCell>

                      <TableCell className="pr-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {waUrl && (
                            <Button
                              asChild
                              size="icon"
                              variant="ghost"
                              className="size-7 text-emerald-500 hover:bg-emerald-500/10"
                              title="Chat on WhatsApp"
                            >
                              <a href={waUrl} target="_blank" rel="noopener noreferrer">
                                <MessageSquare className="size-3.5" />
                              </a>
                            </Button>
                          )}
                          {lead.phone && (
                            <Button
                              asChild
                              size="icon"
                              variant="ghost"
                              className="size-7 text-blue-400 hover:bg-blue-500/10"
                              title="Call phone"
                            >
                              <a href={`tel:${lead.phone}`}>
                                <Phone className="size-3.5" />
                              </a>
                            </Button>
                          )}
                          <Button asChild size="sm" variant="outline" className="h-7 text-xs">
                            <Link href={`/leads/${lead.id}`}>View</Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between border-t border-border px-6 py-3 text-xs text-muted-foreground">
          <span>
            Viewing {filteredLeads.length} of {leads.length} recent opportunities
          </span>
          <Link href="/leads" className="text-primary hover:underline font-medium flex items-center gap-1">
            Open Full Leads CRM
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
