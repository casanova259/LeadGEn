"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

export function Navbar({
  title,
  quickCreateHref,
  quickCreateLabel = "Quick Create",
}: {
  title: string;
  quickCreateHref?: string;
  quickCreateLabel?: string;
}) {
  return (
    <header className="flex h-16 items-center justify-between bg-[#0a0a0a] px-8 text-white">
      <h1 className="text-[18px] font-semibold tracking-[-0.2px]">{title}</h1>

      <div className="flex items-center gap-3">
        {quickCreateHref && (
          <Link
            href={quickCreateHref}
            className="flex h-9 items-center gap-1.5 rounded-lg bg-white px-3.5 text-[13px] font-semibold text-[#0a0a0a] transition hover:bg-zinc-200"
          >
            <Plus size={14} strokeWidth={2.5} />
            {quickCreateLabel}
          </Link>
        )}
        <UserButton
          appearance={{
            elements: {
              userButtonAvatarBox: "h-8 w-8 rounded-full",
            },
          }}
        />
      </div>
    </header>
  );
}