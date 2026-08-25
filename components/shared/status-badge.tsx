export type LeadStatus = "HOT" | "NEW" | "WARM" | "CONVERTED" | "LOST";

const STATUS_STYLES: Record<
  LeadStatus,
  { bg: string; text: string; dot: string }
> = {
  HOT: { bg: "bg-orange-500/15", text: "text-orange-400", dot: "bg-orange-500" },
  NEW: { bg: "bg-blue-500/15", text: "text-blue-400", dot: "bg-blue-500" },
  WARM: { bg: "bg-amber-500/15", text: "text-amber-400", dot: "bg-amber-500" },
  CONVERTED: {
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
    dot: "bg-emerald-500",
  },
  LOST: { bg: "bg-zinc-500/15", text: "text-zinc-400", dot: "bg-zinc-500" },
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold ${s.bg} ${s.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}