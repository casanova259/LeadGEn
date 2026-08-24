import Link from "next/link";
import { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  ctaLabel,
  ctaHref,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-[#e5e7eb] bg-white px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f5f5f5] text-[#6b7280]">
        <Icon size={22} strokeWidth={1.75} />
      </div>
      <h3 className="mt-4 text-[18px] font-semibold text-[#111111]">
        {title}
      </h3>
      <p className="mt-1 max-w-sm text-[14px] leading-relaxed text-[#6b7280]">
        {description}
      </p>
      {ctaLabel && ctaHref && (
        <Link
          href={ctaHref}
          className="mt-6 flex h-10 items-center rounded-lg bg-[#111111] px-5 text-[14px] font-semibold text-white transition hover:bg-[#242424]"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}