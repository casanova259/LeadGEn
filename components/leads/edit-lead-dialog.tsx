"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LeadStatus, LeadPriority } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateLeadAction } from "@/src/server/actions/lead.actions";
import { toast } from "@/components/ui/toast";
import { Loader2 } from "lucide-react";
import { SerializedLead } from "@/components/shared/inline-lead-row";

interface EditLeadDialogProps {
  lead: SerializedLead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditLeadDialog({
  lead,
  open,
  onOpenChange,
}: EditLeadDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(lead?.name ?? "");
  const [phone, setPhone] = useState(lead?.phone ?? "");
  const [email, setEmail] = useState(lead?.email ?? "");
  const [status, setStatus] = useState<LeadStatus>(lead?.status ?? "NEW");
  const [priority, setPriority] = useState<LeadPriority>(lead?.priority ?? "NORMAL");
  const [notes, setNotes] = useState(lead?.notes ?? "");

  // Reset when dialog opens with a new lead
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && lead) {
      setName(lead.name);
      setPhone(lead.phone ?? "");
      setEmail(lead.email ?? "");
      setStatus(lead.status);
      setPriority(lead.priority);
      setNotes(lead.notes ?? "");
    }
    onOpenChange(newOpen);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;

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

        toast({
          message: `Lead "${name.trim() || lead.name}" updated successfully`,
          state: "success",
        });

        onOpenChange(false);
        router.refresh();
      } catch (err: any) {
        toast({
          message: `Update failed: ${err?.message || "Server error"}`,
          state: "error",
        });
      }
    });
  };

  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg bg-[var(--surface-raised)] border-[var(--hairline)] text-[var(--ink)]">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading font-semibold text-[var(--ink)]">
            Edit Lead Details
          </DialogTitle>
          <DialogDescription className="text-xs text-[var(--ink-muted)] font-sans">
            Update contact information, pipeline status, or notes for {lead.name}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="edit-name" className="text-xs font-medium text-[var(--ink)]">
              Full Name *
            </Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-9 text-sm bg-background border-[var(--hairline)]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-phone" className="text-xs font-medium text-[var(--ink)]">
                Phone Number
              </Label>
              <Input
                id="edit-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 234 567 890"
                className="h-9 text-sm bg-background border-[var(--hairline)]"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-email" className="text-xs font-medium text-[var(--ink)]">
                Email Address
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="h-9 text-sm bg-background border-[var(--hairline)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-status" className="text-xs font-medium text-[var(--ink)]">
                Pipeline Stage
              </Label>
              <select
                id="edit-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as LeadStatus)}
                className="w-full h-9 text-xs rounded-md border border-[var(--hairline)] bg-background px-3 text-[var(--ink)] focus-visible:ring-1 focus-visible:ring-[var(--accent-blue)]"
              >
                <option value="NEW">New</option>
                <option value="CONTACTED">Contacted</option>
                <option value="FOLLOW_UP">Follow Up</option>
                <option value="QUALIFIED">Qualified</option>
                <option value="CONVERTED">Converted</option>
                <option value="LOST">Lost</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-priority" className="text-xs font-medium text-[var(--ink)]">
                Priority
              </Label>
              <select
                id="edit-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as LeadPriority)}
                className="w-full h-9 text-xs rounded-md border border-[var(--hairline)] bg-background px-3 text-[var(--ink)] focus-visible:ring-1 focus-visible:ring-[var(--accent-blue)]"
              >
                <option value="NORMAL">Normal</option>
                <option value="HOT">🔥 Hot</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-notes" className="text-xs font-medium text-[var(--ink)]">
              Notes & Context
            </Label>
            <Input
              id="edit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Inquiry requirements, budget, or discussion notes..."
              className="h-9 text-sm bg-background border-[var(--hairline)]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--hairline)]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="text-xs bg-[var(--accent-blue)] text-[#0C0E11] hover:bg-[var(--accent-blue)]/90"
            >
              {isPending && <Loader2 className="size-3.5 mr-1.5 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
