"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { NewLeadForm } from "./new-lead-form";
import { useRouter } from "next/navigation";

interface NewLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewLeadDialog({ open, onOpenChange }: NewLeadDialogProps) {
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-[var(--surface-raised)] border-[var(--hairline)] text-[var(--ink)]">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading font-semibold text-[var(--ink)]">
            Create New Lead
          </DialogTitle>
          <DialogDescription className="text-xs text-[var(--ink-muted)] font-sans">
            Add a new lead to your CRM pipeline. Follow-up tasks will be scheduled automatically.
          </DialogDescription>
        </DialogHeader>
        <NewLeadForm
          onSuccess={(id) => {
            onOpenChange(false);
            router.push(`/leads?created=${encodeURIComponent(id)}`);
            router.refresh();
          }}
          onCancel={() => onOpenChange(false)}
          className="space-y-4 pt-1"
        />
      </DialogContent>
    </Dialog>
  );
}
