"use client";

import { useTransition } from "react";
import { LeadStatus, LeadPriority } from "@prisma/client";
import { markContactedAction, updateLeadAction, deleteLeadAction } from "@/src/server/actions/lead.actions";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MessageSquare, CheckCircle, Trash2, Loader2, Flame } from "lucide-react";

export function LeadDetailActions({
  leadId,
  phone,
  email,
  status,
  priority,
}: {
  leadId: string;
  phone: string | null;
  email: string | null;
  status: LeadStatus;
  priority: LeadPriority;
}) {
  const [isPending, startTransition] = useTransition();

  const handleMarkContacted = () => {
    startTransition(async () => {
      await markContactedAction(leadId);
    });
  };

  const handleStatusChange = (newStatus: LeadStatus) => {
    startTransition(async () => {
      await updateLeadAction(leadId, { status: newStatus });
    });
  };

  const handlePriorityToggle = () => {
    const nextPriority = priority === "HOT" ? "NORMAL" : "HOT";
    startTransition(async () => {
      await updateLeadAction(leadId, { priority: nextPriority });
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to permanently delete this lead?")) {
      startTransition(async () => {
        await deleteLeadAction(leadId);
      });
    }
  };

  const cleanPhone = phone ? phone.replace(/[^\d+]/g, "") : null;
  const waPhone = phone ? phone.replace(/[^\d]/g, "") : null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Contact Channels */}
      {cleanPhone && (
        <Button asChild size="sm" variant="outline" className="h-9 gap-1.5">
          <a href={`tel:${cleanPhone}`}>
            <Phone className="size-3.5 text-blue-500" />
            Call
          </a>
        </Button>
      )}

      {waPhone && (
        <Button asChild size="sm" variant="outline" className="h-9 gap-1.5 text-emerald-600 hover:text-emerald-700">
          <a href={`https://wa.me/${waPhone}`} target="_blank" rel="noopener noreferrer">
            <MessageSquare className="size-3.5 text-emerald-500" />
            WhatsApp
          </a>
        </Button>
      )}

      {email && (
        <Button asChild size="sm" variant="outline" className="h-9 gap-1.5">
          <a href={`mailto:${email}`}>
            <Mail className="size-3.5 text-purple-500" />
            Email
          </a>
        </Button>
      )}

      {/* Mark Contacted (Rescue Queue Clear) */}
      {status !== "CONTACTED" && status !== "CONVERTED" && (
        <Button
          size="sm"
          onClick={handleMarkContacted}
          disabled={isPending}
          className="h-9 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle className="size-3.5" />}
          Mark Contacted
        </Button>
      )}

      {/* Status Selector */}
      <select
        value={status}
        disabled={isPending}
        onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
        className="h-9 text-xs rounded-md border border-input bg-background px-2.5 text-foreground font-medium"
      >
        <option value="NEW">New</option>
        <option value="CONTACTED">Contacted</option>
        <option value="FOLLOW_UP">Follow Up</option>
        <option value="QUALIFIED">Qualified</option>
        <option value="CONVERTED">Converted</option>
        <option value="LOST">Lost</option>
      </select>

      {/* Priority Toggle */}
      <Button
        size="sm"
        variant={priority === "HOT" ? "default" : "outline"}
        onClick={handlePriorityToggle}
        disabled={isPending}
        className={`h-9 gap-1 text-xs ${
          priority === "HOT"
            ? "bg-red-600 hover:bg-red-700 text-white"
            : "text-muted-foreground"
        }`}
      >
        <Flame className="size-3.5" />
        {priority === "HOT" ? "Hot Lead" : "Mark Hot"}
      </Button>

      {/* Delete Lead */}
      <Button
        size="sm"
        variant="ghost"
        onClick={handleDelete}
        disabled={isPending}
        className="h-9 px-2.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
      >
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  );
}
