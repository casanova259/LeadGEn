export type LeadStatus = "HOT" | "NEW" | "WARM" | "CONVERTED" | "LOST";

const STATUS_STYLES: Record<LeadStatus, { bg: string; text: string; dot: string }> = {
  HOT: { bg: "bg-[#fb923c]/15", text: "text-[#c2410c]", dot: "bg-[#fb923c]" },
  NEW: { bg: "bg-[#3b82f6]/15", text: "text-[#1d4ed8]", dot: "bg-[#3b82f6]" },
  WARM: { bg: "bg-[#f59e0b]/15", text: "text-[#b45309]", dot: "bg-[#f59e0b]" },
  CONVERTED: { bg: "bg-[#10b981]/15", text: "text-[#047857]", dot: "bg-[#10b981]" },
  LOST: { bg: "bg-[#6b7280]/15", text: "text-[#374151]", dot: "bg-[#6b7280]" },
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