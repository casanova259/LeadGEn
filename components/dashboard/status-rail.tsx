"use client";

import React from "react";
import Link from "next/link";

export type StatusRailProps = {
  totalLeads: number;
  todaysLeads: number;
  rescueCount: number;
  conversionRate: number;
  converted: number;
  pipelineTrend?: "up" | "down" | "neutral";
};

export function StatusRail({
  totalLeads,
  todaysLeads,
  rescueCount,
  conversionRate,
  converted,
  pipelineTrend = "neutral",
}: StatusRailProps) {
  // 1. Inbound pipeline tick & status
  // Neutral (--ink-faint: #565C64) unless there's a meaningful spike/drop
  let pipelineTickColor = "var(--ink-faint)";
  let pipelineStatusText = "Steady";
  if (todaysLeads > 5 || pipelineTrend === "up") {
    pipelineTickColor = "var(--clear)";
    pipelineStatusText = `+${todaysLeads} today`;
  } else if (todaysLeads > 0) {
    pipelineStatusText = `${todaysLeads} today`;
  }

  // 2. Rescue queue tick & status
  // --clear when count is 0, --urgent when count > 0
  const rescueTickColor = rescueCount === 0 ? "var(--clear)" : "var(--urgent)";
  const rescueStatusText =
    rescueCount === 0 ? "Nothing waiting" : `${rescueCount} need attention`;
  const rescueDescription =
    rescueCount === 0
      ? "All hot leads contacted within 24 hours"
      : "Untouched over 24 hours — contact immediately";

  // 3. Conversion rate tick & status
  // --attention when trending down/low, --clear when trending up/healthy (>= 15%)
  const isConversionHealthy = conversionRate >= 15;
  const conversionTickColor = isConversionHealthy
    ? "var(--clear)"
    : "var(--attention)";
  const conversionStatusText = isConversionHealthy
    ? "On target"
    : "Needs attention";
  const conversionDescription = `${converted} converted to paying customers`;

  return (
    <section aria-label="Status rail">
      <div className="rounded-[12px] border border-[var(--hairline)] bg-[var(--surface)] grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--hairline)] overflow-hidden">
        {/* Column 1: Inbound pipeline */}
        <Link
          href="/leads"
          className="group relative p-5 pl-6 flex flex-col justify-between hover:bg-[var(--surface-raised)]/40 transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[var(--accent-blue)]"
        >
          <div
            className="absolute left-0 top-3.5 bottom-3.5 w-[3px] rounded-r"
            style={{ backgroundColor: pipelineTickColor }}
          />
          <div>
            <div className="flex items-center justify-between text-[13px] font-sans text-[var(--ink-muted)]">
              <span>Inbound pipeline</span>
              <span className="text-[12px] text-[var(--ink-faint)] font-mono">
                {pipelineStatusText}
              </span>
            </div>
            <div className="mt-2.5 font-mono text-[34px] font-medium leading-none text-[var(--ink)] tracking-tight">
              {totalLeads}
            </div>
          </div>
          <p className="mt-3 text-[13px] font-sans text-[var(--ink-muted)]">
            {todaysLeads} new leads captured today
          </p>
        </Link>

        {/* Column 2: Rescue queue */}
        <Link
          href="/leads?priority=HOT"
          className="group relative p-5 pl-6 flex flex-col justify-between hover:bg-[var(--surface-raised)]/40 transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[var(--accent-blue)]"
        >
          <div
            className="absolute left-0 top-3.5 bottom-3.5 w-[3px] rounded-r"
            style={{ backgroundColor: rescueTickColor }}
          />
          <div>
            <div className="flex items-center justify-between text-[13px] font-sans text-[var(--ink-muted)]">
              <span>Rescue queue</span>
              <span
                className="text-[12px] font-sans"
                style={{
                  color: rescueCount > 0 ? "var(--urgent)" : "var(--clear)",
                }}
              >
                {rescueStatusText}
              </span>
            </div>
            <div className="mt-2.5 font-mono text-[34px] font-medium leading-none text-[var(--ink)] tracking-tight">
              {rescueCount}
            </div>
          </div>
          <p className="mt-3 text-[13px] font-sans text-[var(--ink-muted)]">
            {rescueDescription}
          </p>
        </Link>

        {/* Column 3: Conversion rate */}
        <Link
          href="/leads?status=CONVERTED"
          className="group relative p-5 pl-6 flex flex-col justify-between hover:bg-[var(--surface-raised)]/40 transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[var(--accent-blue)]"
        >
          <div
            className="absolute left-0 top-3.5 bottom-3.5 w-[3px] rounded-r"
            style={{ backgroundColor: conversionTickColor }}
          />
          <div>
            <div className="flex items-center justify-between text-[13px] font-sans text-[var(--ink-muted)]">
              <span>Conversion rate</span>
              <span
                className="text-[12px] font-sans"
                style={{
                  color: isConversionHealthy
                    ? "var(--clear)"
                    : "var(--attention)",
                }}
              >
                {conversionStatusText}
              </span>
            </div>
            <div className="mt-2.5 font-mono text-[34px] font-medium leading-none text-[var(--ink)] tracking-tight">
              {conversionRate}%
            </div>
          </div>
          <p className="mt-3 text-[13px] font-sans text-[var(--ink-muted)]">
            {conversionDescription}
          </p>
        </Link>
      </div>
    </section>
  );
}
