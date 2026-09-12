"use client";

import React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type DailyDataPoint = {
  date: string;
  label: string;
  inbound: number;
  isToday: boolean;
};

export function DispatchChart({
  dailyFlow,
  trendDescription,
  totalInPeriod,
}: {
  dailyFlow: DailyDataPoint[];
  trendDescription: string;
  totalInPeriod?: number;
}) {
  const hasData = dailyFlow.length > 0 && dailyFlow.some((d) => d.inbound > 0);

  // Determine Y-axis max domain with 4-5 even intervals
  const maxVal = Math.max(...dailyFlow.map((d) => d.inbound), 4);
  const yDomainMax = Math.ceil(maxVal * 1.25);

  const renderCustomDot = (props: any) => {
    const { cx, cy, payload, index } = props;
    if (payload?.isToday || index === dailyFlow.length - 1) {
      return (
        <g key={`dot-ring-${index}`}>
          {/* Outer lower-opacity ring */}
          <circle cx={cx} cy={cy} r={8} fill="#7C9CD9" fillOpacity={0.25} />
          {/* Inner filled dot */}
          <circle
            cx={cx}
            cy={cy}
            r={4}
            fill="#7C9CD9"
            stroke="#0C0E11"
            strokeWidth={1.5}
          />
        </g>
      );
    }
    return null;
  };

  return (
    <div className="rounded-[12px] border border-[var(--hairline)] bg-[var(--surface)] p-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-6">
        <div>
          <h2 className="font-heading text-[18px] font-normal text-[var(--ink)] tracking-tight">
            Inbound Flow
          </h2>
          <p className="text-[13px] font-sans text-[var(--ink-muted)] mt-0.5">
            {trendDescription}
          </p>
        </div>

        {totalInPeriod !== undefined && (
          <div className="text-right">
            <span className="font-mono text-[20px] font-medium text-[var(--ink)] tabular-nums">
              {totalInPeriod}
            </span>
            <span className="text-[12px] font-sans text-[var(--ink-muted)] ml-1.5">
              total active
            </span>
          </div>
        )}
      </div>

      {!hasData ? (
        <div className="flex h-56 w-full flex-col items-center justify-center rounded-[8px] border border-dashed border-[var(--hairline)] bg-[var(--surface-raised)]/20 p-6 text-center">
          <p className="text-[13px] font-sans text-[var(--ink-muted)]">
            No inquiries recorded in this period yet.
          </p>
          <p className="text-[12px] font-sans text-[var(--ink-faint)] mt-1">
            New leads captured via website form or WhatsApp will plot here automatically.
          </p>
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={dailyFlow}
              margin={{ top: 12, right: 12, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="dispatchAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7C9CD9" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="#7C9CD9" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                vertical={false}
                stroke="#242A30"
                strokeDasharray="0"
              />

              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={{ stroke: "#242A30" }}
                tick={{
                  fill: "#565C64",
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                }}
                dy={8}
              />

              <YAxis
                allowDecimals={false}
                domain={[0, yDomainMax]}
                tickCount={5}
                tickLine={false}
                axisLine={false}
                tick={{
                  fill: "#565C64",
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                }}
                dx={-4}
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as DailyDataPoint;
                    return (
                      <div className="rounded-[8px] border border-[var(--hairline)] bg-[var(--surface-raised)] px-3 py-2 shadow-xl backdrop-blur-md">
                        <div className="font-mono text-[11px] text-[var(--ink-muted)]">
                          {data.date}
                        </div>
                        <div className="mt-0.5 font-mono text-[13px] font-medium text-[var(--ink)]">
                          {data.inbound} {data.inbound === 1 ? "inquiry" : "inquiries"}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Area
                type="linear"
                dataKey="inbound"
                stroke="#7C9CD9"
                strokeWidth={2}
                fill="url(#dispatchAreaGradient)"
                dot={renderCustomDot}
                activeDot={{
                  r: 5,
                  fill: "#7C9CD9",
                  stroke: "#EDEBE6",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
