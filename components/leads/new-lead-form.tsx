"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LeadSource, LeadPriority } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FormSelect } from "@/components/shared/Form-select";
import { toast } from "@/components/ui/toast";
import { Loader2, Plus, ArrowLeft } from "lucide-react";

interface NewLeadFormProps {
  onSuccess?: (leadId: string) => void;
  onCancel?: () => void;
  className?: string;
}

export function NewLeadForm({ onSuccess, onCancel, className }: NewLeadFormProps) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [source, setSource] = useState<LeadSource>(LeadSource.WEBSITE);
  const [priority, setPriority] = useState<LeadPriority>(LeadPriority.NORMAL);
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Prevent double submits while in-flight
    if (isSubmittingRef.current || isSubmitting) {
      return;
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      toast({
        message: "Please enter a name for the lead.",
        state: "error",
      });
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const payload = {
        name: trimmedName,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        source,
        priority,
        notes: notes.trim() || undefined,
      };

      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        // API error (4xx/5xx): Stay on form, show error toast with --urgent tick, do NOT redirect
        const errorMessage = data?.error || `Failed to create lead (${response.status})`;
        toast({
          message: errorMessage,
          state: "error",
        });
        isSubmittingRef.current = false;
        setIsSubmitting(false);
        return;
      }

      // API confirmed success (2xx)
      const createdLead = data?.lead;
      const createdName = createdLead?.name || trimmedName;
      const createdId = createdLead?.id;

      // 1. Show confirmation toast
      toast({
        message: `Lead added — ${createdName} is now in your pipeline.`,
        state: "success",
      });

      // 2. Custom callback or redirect to /leads with created ID
      if (onSuccess && createdId) {
        onSuccess(createdId);
      } else {
        const targetUrl = createdId ? `/leads?created=${encodeURIComponent(createdId)}` : "/leads";
        router.push(targetUrl);
        router.refresh();
      }
    } catch (err: any) {
      console.error("Failed to submit lead:", err);
      toast({
        message: err?.message || "Network error. Please try again.",
        state: "error",
      });
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={className ?? "space-y-5"}>
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-xs font-medium text-[var(--ink)]">
          Full Name <span className="text-[var(--urgent)]">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          placeholder="e.g. Sarah Connor"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSubmitting}
          required
          autoFocus
          className="bg-[var(--surface)] border-[var(--hairline)] text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus-visible:ring-[var(--accent-blue)]"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-xs font-medium text-[var(--ink)]">
            Phone Number
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+1 (555) 234-5678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={isSubmitting}
            className="bg-[var(--surface)] border-[var(--hairline)] text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus-visible:ring-[var(--accent-blue)]"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-medium text-[var(--ink)]">
            Email Address
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="sarah@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            className="bg-[var(--surface)] border-[var(--hairline)] text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus-visible:ring-[var(--accent-blue)]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-[var(--ink)]">
            Lead Source <span className="text-[var(--urgent)]">*</span>
          </Label>
          <FormSelect
            name="source"
            value={source}
            onValueChange={(val) => setSource(val as LeadSource)}
            disabled={isSubmitting}
            required
            options={[
              { value: "WEBSITE", label: "Website" },
              { value: "WHATSAPP", label: "WhatsApp" },
              { value: "PHONE", label: "Phone" },
              { value: "WALK_IN", label: "Walk-in" },
              { value: "FACEBOOK_ADS", label: "Facebook Ads" },
              { value: "INSTAGRAM_ADS", label: "Instagram Ads" },
              { value: "GOOGLE_ADS", label: "Google Ads" },
              { value: "OTHER", label: "Other" },
            ]}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-[var(--ink)]">Priority</Label>
          <FormSelect
            name="priority"
            value={priority}
            onValueChange={(val) => setPriority(val as LeadPriority)}
            disabled={isSubmitting}
            options={[
              { value: "NORMAL", label: "Normal" },
              { value: "HOT", label: "Hot (Follow-up within 24h)" },
            ]}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes" className="text-xs font-medium text-[var(--ink)]">
          Initial Notes
        </Label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          placeholder="Add context about this lead's inquiry or requirements..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isSubmitting}
          className="w-full rounded-md px-3 py-2 text-sm bg-[var(--surface)] border border-[var(--hairline)] text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-blue)]"
        />
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[var(--hairline)]">
        {onCancel ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
            className="text-xs text-[var(--ink-muted)] hover:text-[var(--ink)]"
          >
            Cancel
          </Button>
        ) : (
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] gap-1.5"
          >
            <Link href="/leads">
              <ArrowLeft className="size-3.5" />
              Back to Leads
            </Link>
          </Button>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-9 px-4 text-xs font-medium bg-[var(--accent-blue)] hover:bg-[var(--accent-blue)]/90 text-[#0C0E11] gap-2 transition-all cursor-pointer disabled:cursor-not-allowed min-w-[130px] justify-center"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              <span>Creating Lead...</span>
            </>
          ) : (
            <>
              <Plus className="size-3.5" />
              <span>Create Lead</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
