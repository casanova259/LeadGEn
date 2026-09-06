"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type MonthlyFlowPoint = {
  month: string;
  date: string;
  leads: number;
  converted: number;
};

export type SourceDistribution = {
  name: string;
  value: number;
};

const pipelineChartConfig = {
  leads: {
    label: "New Inquiries",
    color: "var(--color-chart-1, #6366f1)",
  },
  converted: {
    label: "Converted Clients",
    color: "var(--color-chart-2, #22c55e)",
  },
} satisfies ChartConfig;

export function CrmPipelineFlow({
  monthlyFlow,
  bySource,
  totalLeads,
  converted,
  conversionRate,
}: {
  monthlyFlow: MonthlyFlowPoint[];
  bySource: SourceDistribution[];
  totalLeads: number;
  converted: number;
  conversionRate: number;
}) {
  const [viewMode, setViewMode] = useState<"monthly" | "source">("monthly");

  // Fallback realistic timeline points if brand new account with 0 history
  const chartData = useMemo(() => {
    if (viewMode === "source") {
      return bySource.map((s) => ({
        label: s.name.replace("_", " "),
        leads: s.value,
        converted: 0,
      }));
    }

    const hasData = monthlyFlow.some((m) => m.leads > 0);
    if (!hasData) {
      // Return sensible preview so chart isn't an empty void for new user
      return [
        { label: "May", leads: 4, converted: 1 },
        { label: "Jun", leads: 7, converted: 2 },
        { label: "Jul", leads: 11, converted: 3 },
        { label: "Aug", leads: 14, converted: 5 },
        { label: "Sep", leads: Math.max(totalLeads, 18), converted: Math.max(converted, 6) },
      ];
    }

    return monthlyFlow.map((m) => ({
      label: m.month,
      leads: m.leads,
      converted: m.converted,
    }));
  }, [viewMode, monthlyFlow, bySource, totalLeads, converted]);

  const topSource = useMemo(() => {
    if (bySource.length === 0) return "Website";
    return [...bySource].sort((a, b) => b.value - a.value)[0]?.name || "Website";
  }, [bySource]);

  return (
    <Card className="xl:col-span-12">
      <CardHeader>
        <div>
          <CardTitle>Lead Inflow & Conversion Flow</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Capture rate, source velocity, and client conversion momentum over time.
          </p>
        </div>
        <CardAction>
          <Select
            value={viewMode}
            onValueChange={(val) => setViewMode(val as "monthly" | "source")}
          >
            <SelectTrigger className="w-36 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">6-Month Trend</SelectItem>
              <SelectItem value="source">By Lead Channel</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <ChartContainer
            config={pipelineChartConfig}
            className="h-72 w-full lg:col-span-8"
          >
            <BarChart
              data={chartData}
              margin={{ left: 10, right: 10, top: 10, bottom: 0 }}
              barSize={32}
            >
              <defs>
                <pattern
                  id="crm-qualified-pattern"
                  width="4"
                  height="4"
                  patternUnits="userSpaceOnUse"
                  patternTransform="rotate(45)"
                >
                  <rect
                    width="6"
                    height="6"
                    fill="var(--color-chart-1, #6366f1)"
                    fillOpacity="0.2"
                  />
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="6"
                    stroke="var(--color-chart-1, #6366f1)"
                    strokeWidth="1.25"
                    strokeOpacity="0.5"
                  />
                </pattern>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.15} />
              <XAxis
                dataKey="label"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tick={{ fill: "var(--muted-foreground, #888)", fontSize: 11 }}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted-foreground, #888)", fontSize: 11 }}
              />
              <ChartTooltip content={<ChartTooltipContent hideIndicator />} />
              <Bar
                dataKey="leads"
                name="Leads"
                fill="url(#crm-qualified-pattern)"
                radius={[6, 6, 0, 0]}
                stroke="var(--color-chart-1, #6366f1)"
                strokeOpacity={0.8}
                strokeWidth={1}
              />
            </BarChart>
          </ChartContainer>

          <div className="flex flex-col justify-between gap-5 rounded-xl border border-border/70 bg-card/40 p-5 lg:col-span-4">
            <div className="space-y-1">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Pipeline Volume
              </div>
              <div className="text-3xl font-bold tracking-tight text-foreground">
                {totalLeads} <span className="text-sm font-normal text-muted-foreground">inquiries captured</span>
              </div>
              <p className="text-xs text-muted-foreground pt-1">
                Top acquisition source: <strong className="text-foreground">{topSource.replace("_", " ")}</strong>
              </p>
            </div>

            <div className="space-y-3 rounded-lg border border-border/60 bg-background/60 p-4">
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Conversion Efficiency
              </div>

              <div className="space-y-1">
                <div className="text-2xl font-bold tracking-tight text-foreground">
                  {conversionRate}% <span className="text-xs font-normal text-emerald-500 font-medium">win rate</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {converted} of {totalLeads} total leads turned into paying clients.
                </p>
              </div>

              <div className="space-y-1.5 pt-1">
                <Progress value={Math.min(conversionRate, 100)} className="h-2 bg-muted" />
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{converted} Converted</span>
                  <span>{totalLeads} Total Leads</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/50 pt-3">
              <span>Goal: 20%+ Conversion</span>
              <span className={conversionRate >= 20 ? "text-emerald-500 font-medium" : "text-amber-500 font-medium"}>
                {conversionRate >= 20 ? "Target Reached 🎉" : "Room for Follow-up 📈"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
