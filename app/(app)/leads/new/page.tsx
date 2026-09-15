"use client";

import Link from "next/link";
import { NewLeadForm } from "@/components/leads/new-lead-form";
import { ChevronRight } from "lucide-react";

export default function NewLeadPage() {
  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-6">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[var(--ink-muted)]">
        <Link href="/leads" className="hover:text-[var(--ink)] transition-colors">
          Leads
        </Link>
        <ChevronRight className="size-3 text-[var(--ink-faint)]" />
        <span className="text-[var(--ink)] font-medium">New Lead</span>
      </nav>

      {/* Card Header */}
      <div>
        <h1 className="text-2xl font-heading font-semibold text-[var(--ink)] tracking-tight">
          Create New Lead
        </h1>
        <p className="text-xs text-[var(--ink-muted)] mt-1 font-sans">
          Capture incoming buyer or seller opportunities into your pipeline. Follow-up tasks are scheduled automatically.
        </p>
      </div>

      {/* Main Form Card */}
      <div className="rounded-[12px] border border-[var(--hairline)] bg-[var(--surface-raised)] p-6 shadow-sm">
        <NewLeadForm />
      </div>
    </div>
  );
}