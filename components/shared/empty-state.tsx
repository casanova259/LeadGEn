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
    <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-800 bg-[#111113] px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 text-zinc-400">
        <Icon size={22} strokeWidth={1.75} />
      </div>
      <h3 className="mt-4 text-[16px] font-semibold text-white">{title}</h3>
      <p className="mt-1 max-w-sm text-[13px] leading-relaxed text-zinc-500">
        {description}
      </p>
      {ctaLabel && ctaHref && (
        <Link
          href={ctaHref}
          className="mt-6 flex h-9 items-center rounded-lg bg-white px-4 text-[13px] font-semibold text-[#0a0a0a] transition hover:bg-zinc-200"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}