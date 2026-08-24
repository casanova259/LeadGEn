import { ReactNode } from "react";

export function DashboardCard({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-[#e5e7eb] bg-white p-6 ${className}`}
    >
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between">
          {title && (
            <h3 className="text-[18px] font-semibold text-[#111111]">
              {title}
            </h3>
          )}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta?: string;
}) {
  return (
    <div className="rounded-xl border border-[#e5e7eb] bg-white p-6">
      <p className="text-[13px] font-medium text-[#6b7280]">{label}</p>
      <p className="mt-2 text-[28px] font-semibold tracking-[-0.5px] text-[#111111]">
        {value}
      </p>
      {delta && (
        <p className="mt-1 text-[12px] font-medium text-[#10b981]">{delta}</p>
      )}
    </div>
  );
}