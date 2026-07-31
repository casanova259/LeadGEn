"use client";

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4", "#a855f7"];

export function AnalyticsCharts({
  bySource,
  byStatus,
  conversionRate,
}: {
  bySource: { name: string; value: number }[];
  byStatus: { name: string; value: number }[];
  conversionRate: number;
}) {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="border rounded-md p-4">
        <div className="text-sm font-medium mb-2">Leads by Source</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={bySource}>
            <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={50} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="border rounded-md p-4">
        <div className="text-sm font-medium mb-2">Status Distribution</div>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={byStatus} dataKey="value" nameKey="name" innerRadius={40} outerRadius={80}>
              {byStatus.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="border rounded-md p-4 flex flex-col items-center justify-center">
        <div className="text-sm font-medium mb-2">Conversion Rate</div>
        <div className="text-5xl font-bold">{conversionRate}%</div>
        <div className="text-xs text-muted-foreground mt-1">of all leads converted</div>
      </div>
    </div>
  );
}