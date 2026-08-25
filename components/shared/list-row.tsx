import Link from "next/link";
import { ReactNode } from "react";

export function ListRow({
  href,
  leading,
  primary,
  secondary,
  trailing,
}: {
  href?: string;
  leading?: ReactNode;
  primary: ReactNode;
  secondary?: ReactNode;
  trailing?: ReactNode;
}) {
  const content = (
    <div className="flex items-center justify-between gap-4 rounded-lg px-3.5 py-3 transition hover:bg-zinc-900">
      <div className="flex min-w-0 items-center gap-3">
        {leading}
        <div className="min-w-0">
          <p className="truncate text-[14px] font-medium text-white">
            {primary}
          </p>
          {secondary && (
            <p className="truncate text-[12px] text-zinc-500">{secondary}</p>
          )}
        </div>
      </div>
      {trailing && (
        <div className="shrink-0 text-[12px] font-medium text-zinc-500">
          {trailing}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }
  return content;
}

export function ListRowDivider() {
  return <div className="h-px bg-zinc-800" />;
}