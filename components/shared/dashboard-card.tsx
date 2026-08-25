import { ReactNode } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export function DashboardCard({
  title,
  subtitle,
  action,
  children,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-zinc-800 bg-[#111113] p-6 ${className}`}
    >
      {(title || action) && (
        <div className="mb-5 flex items-start justify-between">
          <div>
            {title && (
              <h3 className="text-[16px] font-semibold text-white">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-0.5 text-[13px] text-zinc-500">{subtitle}</p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

/**
 * trend: pass a signed number (e.g. 12.5 or -20) if you have a real
 * period-over-period comparison. If you don't have that data yet,
 * omit `trend` and `trendLabel` — don't fabricate a percentage.
 */
export function StatCard({
  label,
  value,
  trend,
  trendLabel,
  description,
}: {
  label: string;
  value: string;
  trend?: number;
  trendLabel?: string;
  description?: string;
}) {
  const isUp = typeof trend === "number" && trend >= 0;

  return (
    <div className="rounded-xl border border-zinc-800 bg-[#111113] p-5">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-zinc-400">{label}</p>
        {typeof trend === "number" && (
          <span
            className={`flex items-center gap-0.5 rounded-full border px-2 py-0.5 text-[12px] font-medium ${
              isUp
                ? "border-emerald-900 text-emerald-400"
                : "border-red-900 text-red-400"
            }`}
          >
            {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {isUp ? "+" : ""}
            {trend}%
          </span>
        )}
      </div>

      <p className="mt-2 text-[28px] font-semibold tracking-[-0.5px] text-white">
        {value}
      </p>

      {trendLabel && (
        <p className="mt-2 flex items-center gap-1 text-[13px] font-medium text-white">
          {trendLabel}
          {typeof trend === "number" &&
            (isUp ? (
              <ArrowUpRight size={13} />
            ) : (
              <ArrowDownRight size={13} />
            ))}
        </p>
      )}
      {description && (
        <p className="text-[13px] text-zinc-500">{description}</p>
      )}
    </div>
  );
}