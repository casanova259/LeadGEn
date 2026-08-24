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
    <div className="flex items-center justify-between gap-4 rounded-xl px-3.5 py-3 transition hover:bg-[#f8f9fa]">
      <div className="flex min-w-0 items-center gap-3">
        {leading}
        <div className="min-w-0">
          <p className="truncate text-[14px] font-medium text-[#111111]">
            {primary}
          </p>
          {secondary && (
            <p className="truncate text-[12px] text-[#6b7280]">{secondary}</p>
          )}
        </div>
      </div>
      {trailing && (
        <div className="shrink-0 text-[12px] font-medium text-[#898989]">
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
  return <div className="h-px bg-[#f3f4f6]" />;
}