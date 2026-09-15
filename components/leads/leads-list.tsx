"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { InlineLeadRow, SerializedLead } from "@/components/shared/inline-lead-row";

interface LeadsListProps {
  leads: SerializedLead[];
  highlightId?: string;
}

export function LeadsList({ leads, highlightId }: LeadsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(null);
  const refreshedRef = useRef(false);

  const targetId = highlightId || searchParams.get("created") || undefined;

  useEffect(() => {
    if (!targetId) return;

    // Edge case safeguard: Make sure the target lead is actually in the list data
    // before attempting to scroll or highlight it. Do NOT highlight a stale position.
    const isTargetPresent = leads.some((lead) => lead.id === targetId);

    if (!isTargetPresent) {
      // If list has not refetched yet, trigger a router.refresh() once to pull the fresh data
      if (!refreshedRef.current) {
        refreshedRef.current = true;
        router.refresh();
      }
      return;
    }

    // Lead is confirmed present in the list data!
    setActiveHighlightId(targetId);

    // Scroll into view smoothly
    const timer = setTimeout(() => {
      const el = document.getElementById(`lead-${targetId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }, 50);

    // Remove highlight after 2s flash
    const clearTimer = setTimeout(() => {
      setActiveHighlightId(null);

      // Cleanly remove `created` query parameter from URL without triggering reload
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
      clearTimeout(timer);
      clearTimeout(clearTimer);
    };
  }, [targetId, leads, router]);

  if (leads.length === 0) {
    return (
      <div className="border border-[var(--hairline)] rounded-md bg-card p-6 text-sm text-muted-foreground text-center">
        No leads yet.
      </div>
    );
  }

  return (
    <div className="border border-[var(--hairline)] rounded-md divide-y divide-[var(--hairline)] bg-card overflow-hidden">
      {leads.map((lead) => (
        <InlineLeadRow
          key={lead.id}
          lead={lead}
          isHighlighted={lead.id === activeHighlightId}
        />
      ))}
    </div>
  );
}
