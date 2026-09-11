"use client";

import { useId, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { formatDate } from "@/components/formater";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Delta, DeltaIcon, DeltaValue } from "@/components/delta";

type PeriodDays = 7 | 30;

export type LeadChartRow = {
	date: string;
	inbound: number;
	converted: number;
};

// Fallback baseline data if brand new tenant account has no entries yet
const fallbackChartData: LeadChartRow[] = [
	{ date: "2026-08-13", inbound: 5, converted: 2 },
	{ date: "2026-08-14", inbound: 8, converted: 3 },
	{ date: "2026-08-15", inbound: 6, converted: 1 },
	{ date: "2026-08-16", inbound: 11, converted: 4 },
	{ date: "2026-08-17", inbound: 9, converted: 3 },
	{ date: "2026-08-18", inbound: 14, converted: 5 },
	{ date: "2026-08-19", inbound: 12, converted: 4 },
	{ date: "2026-08-20", inbound: 16, converted: 6 },
	{ date: "2026-08-21", inbound: 15, converted: 5 },
	{ date: "2026-08-22", inbound: 18, converted: 7 },
	{ date: "2026-08-23", inbound: 13, converted: 4 },
	{ date: "2026-08-24", inbound: 19, converted: 8 },
	{ date: "2026-08-25", inbound: 21, converted: 9 },
	{ date: "2026-08-26", inbound: 17, converted: 6 },
	{ date: "2026-08-27", inbound: 23, converted: 10 },
	{ date: "2026-08-28", inbound: 20, converted: 7 },
	{ date: "2026-08-29", inbound: 24, converted: 11 },
	{ date: "2026-08-30", inbound: 22, converted: 9 },
	{ date: "2026-08-31", inbound: 26, converted: 12 },
	{ date: "2026-09-01", inbound: 25, converted: 10 },
	{ date: "2026-09-02", inbound: 28, converted: 13 },
	{ date: "2026-09-03", inbound: 24, converted: 11 },
	{ date: "2026-09-04", inbound: 31, converted: 14 },
	{ date: "2026-09-05", inbound: 29, converted: 12 },
	{ date: "2026-09-06", inbound: 33, converted: 15 },
	{ date: "2026-09-07", inbound: 30, converted: 13 },
	{ date: "2026-09-08", inbound: 35, converted: 16 },
	{ date: "2026-09-09", inbound: 32, converted: 14 },
	{ date: "2026-09-10", inbound: 38, converted: 18 },
	{ date: "2026-09-11", inbound: 36, converted: 17 },
];

function parseChartDay(isoDate: string) {
	return new Date(`${isoDate}T12:00:00`);
}

function rowTotal(row: LeadChartRow) {
	return row.inbound + row.converted;
}

const chartConfig = {
	inbound: {
		label: "Inbound Leads",
		color: "var(--chart-1, #6366f1)",
	},
	converted: {
		label: "Converted Clients",
		color: "var(--chart-2, #10b981)",
	},
} satisfies ChartConfig;

const animationConfig = {
	glowWidth: 520,
};

function highlightXFromChartMouseEvent(e: unknown): number | null {
	const ex = e as {
		activeCoordinate?: { x?: number; y?: number };
		chartX?: number;
	};
	const fromActive = ex.activeCoordinate?.x;
	if (typeof fromActive === "number" && Number.isFinite(fromActive)) {
		return fromActive;
	}
	const legacy = ex.chartX;
	if (typeof legacy === "number" && Number.isFinite(legacy)) {
		return legacy;
	}
	return null;
}

export function SalesChart({ data }: { data?: LeadChartRow[] }) {
	const chartUid = useId().replace(/:/g, "");
	const idMaskGrad = `sales-chart-mask-grad-${chartUid}`;
	const idMask = `sales-chart-highlight-mask-${chartUid}`;

	const [periodDays, setPeriodDays] = useState<PeriodDays>(7);
	const [xAxis, setXAxis] = useState<number | null>(null);

	const resolvedData = useMemo(() => {
		if (data && data.length > 0 && data.some((d) => d.inbound > 0 || d.converted > 0)) {
			return data;
		}
		return fallbackChartData;
	}, [data]);

	const lastChartRow = resolvedData.at(-1) ?? fallbackChartData.at(-1)!;
	const salesChartReferenceDate = parseChartDay(lastChartRow.date);

	const chartRows = useMemo(() => {
		const startDate = new Date(salesChartReferenceDate);
		startDate.setDate(startDate.getDate() - (periodDays - 1));
		return resolvedData.filter((item) => parseChartDay(item.date) >= startDate);
	}, [resolvedData, periodDays, salesChartReferenceDate]);

	const growthPctNum = useMemo(() => {
		const first = chartRows[0];
		if (!first) return 0;
		const last = chartRows.at(-1);
		if (!last) return 0;
		const a = rowTotal(first);
		const b = rowTotal(last);
		if (!a) return b > 0 ? 100 : 0;
		return ((b - a) / a) * 100;
	}, [chartRows]);

	const xAxisMinTickGap: number | undefined = periodDays > 7 ? 32 : undefined;

	const idGradConverted = `sales-chart-grad-converted-${chartUid}`;
	const idGradInbound = `sales-chart-grad-inbound-${chartUid}`;

	return (
		<Card className="rounded-none border-0 bg-background py-4 shadow-none ring-0 lg:col-span-3">
			<CardHeader>
				<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
					<div className="min-w-0 space-y-1">
						<div className="flex flex-wrap items-center gap-2">
							<CardTitle className="text-base font-semibold">Lead Inflow & Conversion Momentum</CardTitle>
							<Delta value={growthPctNum} variant="badge">
								<DeltaIcon variant="trend" />
								<DeltaValue />
							</Delta>
						</div>
						<CardDescription>
							Daily inbound customer inquiries vs converted deals, last {periodDays} days.
						</CardDescription>
					</div>
					<Select
						onValueChange={(v) => {
							const n = Number(v);
							if (n === 7 || n === 30) {
								setPeriodDays(n);
							}
						}}
						value={String(periodDays)}
					>
						<SelectTrigger
							aria-label="Lead chart time range"
							className="w-full min-w-36 sm:w-fit"
							size="sm"
						>
							<SelectValue placeholder="Range" />
						</SelectTrigger>
						<SelectContent align="end">
							<SelectItem value="7">Last 7 days</SelectItem>
							<SelectItem value="30">Last 30 days</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</CardHeader>
			<CardContent>
				<ChartContainer
					className="aspect-21/9 min-h-48 w-full p-0"
					config={chartConfig}
				>
					<AreaChart
						data={chartRows}
						margin={{
							left: 4,
							right: 12,
							top: 8,
						}}
						onMouseLeave={() => setXAxis(null)}
						onMouseMove={(e) => setXAxis(highlightXFromChartMouseEvent(e))}
					>
						<CartesianGrid
							className="stroke-border"
							strokeDasharray="3 3"
							vertical={false}
						/>
						<XAxis
							axisLine={false}
							dataKey="date"
							interval={periodDays <= 7 ? 0 : "preserveStartEnd"}
							minTickGap={xAxisMinTickGap}
							tickFormatter={(value) => formatDate(String(value), "day-month")}
							tickLine={false}
							tickMargin={8}
						/>
						<ChartTooltip content={<ChartTooltipContent />} cursor={false} />

						<defs>
							<linearGradient id={idMaskGrad} x1="0" x2="1" y1="0" y2="0">
								<stop offset="0%" stopColor="transparent" />
								<stop offset="28%" stopColor="white" stopOpacity={0.55} />
								<stop offset="50%" stopColor="white" />
								<stop offset="72%" stopColor="white" stopOpacity={0.55} />
								<stop offset="100%" stopColor="transparent" />
							</linearGradient>
							<linearGradient id={idGradConverted} x1="0" x2="0" y1="0" y2="1">
								<stop
									offset="5%"
									stopColor="var(--chart-2, #10b981)"
									stopOpacity={0.4}
								/>
								<stop
									offset="95%"
									stopColor="var(--chart-2, #10b981)"
									stopOpacity={0}
								/>
							</linearGradient>
							<linearGradient id={idGradInbound} x1="0" x2="0" y1="0" y2="1">
								<stop
									offset="5%"
									stopColor="var(--chart-1, #6366f1)"
									stopOpacity={0.4}
								/>
								<stop
									offset="95%"
									stopColor="var(--chart-1, #6366f1)"
									stopOpacity={0}
								/>
							</linearGradient>
							{typeof xAxis === "number" && Number.isFinite(xAxis) ? (
								<mask id={idMask}>
									<rect
										fill={`url(#${idMaskGrad})`}
										height="100%"
										width={animationConfig.glowWidth}
										x={xAxis - animationConfig.glowWidth / 2}
										y={0}
									/>
								</mask>
							) : null}
						</defs>
						<Area
							dataKey="converted"
							fill={`url(#${idGradConverted})`}
							fillOpacity={0.4}
							mask={`url(#${idMask})`}
							stackId="a"
							stroke="var(--chart-2, #10b981)"
							strokeWidth={1.5}
							type="monotone"
						/>
						<Area
							dataKey="inbound"
							fill={`url(#${idGradInbound})`}
							fillOpacity={0.4}
							mask={`url(#${idMask})`}
							stackId="a"
							stroke="var(--chart-1, #6366f1)"
							strokeWidth={1.5}
							type="monotone"
						/>
					</AreaChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
