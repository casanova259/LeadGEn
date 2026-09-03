"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { LeadStatus, LeadPriority, LeadSource } from "@prisma/client";
import { updateLeadAction } from "@/src/server/actions/lead.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Check, X, Loader2, Flame, Phone, Mail, FileText } from "lucide-react";

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

const STATUS_COLORS: Record<LeadStatus, string> = {
  NEW: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  CONTACTED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  FOLLOW_UP: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  QUALIFIED: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  CONVERTED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  LOST: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

export function InlineLeadRow({ lead }: { lead: SerializedLead }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(lead.name);
  const [phone, setPhone] = useState(lead.phone ?? "");
  const [email, setEmail] = useState(lead.email ?? "");
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [priority, setPriority] = useState<LeadPriority>(lead.priority);
  const [notes, setNotes] = useState(lead.notes ?? "");

  const handleCancel = () => {
    setName(lead.name);
    setPhone(lead.phone ?? "");
    setEmail(lead.email ?? "");
    setStatus(lead.status);
    setPriority(lead.priority);
    setNotes(lead.notes ?? "");
    setIsEditing(false);
  };

  const handleSave = () => {
    startTransition(async () => {
      try {
        await updateLeadAction(lead.id, {
          name: name.trim() || lead.name,
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
          status,
          priority,
          notes: notes.trim() || undefined,
        });
        setIsEditing(false);
      } catch (err) {
        console.error("Failed to update lead:", err);
      }
    });
  };

  if (isEditing) {
    return (
      <div className="p-4 bg-muted/40 border-l-2 border-l-primary space-y-3 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Quick Edit Lead
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancel}
              disabled={isPending}
              className="h-8 px-2.5 text-xs text-muted-foreground"
            >
              <X className="size-3.5 mr-1" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isPending}
              className="h-8 px-3 text-xs"
            >
              {isPending ? (
                <Loader2 className="size-3.5 mr-1 animate-spin" />
              ) : (
                <Check className="size-3.5 mr-1" />
              )}
              Save
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-8 text-xs bg-background"
              placeholder="Full name"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">Phone</label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-8 text-xs bg-background"
              placeholder="+1 234 567 890"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">Email</label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-8 text-xs bg-background"
              placeholder="email@example.com"
            />
          </div>

          <div className="flex gap-2">
            <div className="flex-1 space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as LeadStatus)}
                className="w-full h-8 text-xs rounded-md border border-input bg-background px-2 text-foreground"
              >
                <option value="NEW">New</option>
                <option value="CONTACTED">Contacted</option>
                <option value="FOLLOW_UP">Follow Up</option>
                <option value="QUALIFIED">Qualified</option>
                <option value="CONVERTED">Converted</option>
                <option value="LOST">Lost</option>
              </select>
            </div>

            <div className="w-24 space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as LeadPriority)}
                className="w-full h-8 text-xs rounded-md border border-input bg-background px-2 text-foreground"
              >
                <option value="NORMAL">Normal</option>
                <option value="HOT">🔥 Hot</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground">Notes</label>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="h-8 text-xs bg-background"
            placeholder="Add quick notes or context..."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="group flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 hover:bg-muted/30 transition text-sm gap-2">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Link
            href={`/leads/${lead.id}`}
            className="font-medium text-foreground truncate hover:underline"
          >
            {lead.name}
          </Link>
          {lead.priority === "HOT" && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-red-500">
              <Flame size={10} />
              HOT
            </span>
          )}
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase ${
              STATUS_COLORS[lead.status]
            }`}
          >
            {lead.status.replace("_", " ")}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
          {lead.phone && (
            <span className="flex items-center gap-1">
              <Phone size={11} className="shrink-0 text-muted-foreground/70" />
              {lead.phone}
            </span>
          )}
          {lead.email && (
            <span className="flex items-center gap-1">
              <Mail size={11} className="shrink-0 text-muted-foreground/70" />
              {lead.email}
            </span>
          )}
          {!lead.phone && !lead.email && <span>No contact info</span>}
          {lead.notes && (
            <span className="flex items-center gap-1 italic text-muted-foreground/90 truncate max-w-md">
              <FileText size={11} className="shrink-0 text-muted-foreground/70" />
              {lead.notes}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditing(true)}
          className="h-7 px-2.5 text-xs text-muted-foreground opacity-80 group-hover:opacity-100 transition"
        >
          <Pencil size={11} className="mr-1" />
          Edit
        </Button>
      </div>
    </div>
  );
}
