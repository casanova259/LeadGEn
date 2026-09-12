"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Settings,
  Flame,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar({
  businessName = "Lost Leads",
  rescueCount = 0,
}: {
  businessName?: string;
  rescueCount?: number;
}) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-[var(--hairline)] bg-[var(--surface)] text-[var(--ink-muted)] font-sans">
      {/* Business / logo */}
      <div className="flex h-16 items-center gap-2.5 px-5 border-b border-[var(--hairline)]">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--surface-raised)] text-[var(--accent-blue)] border border-[var(--hairline)]">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 1L9.8 6.2L15 8L9.8 9.8L8 15L6.2 9.8L1 8L6.2 6.2L8 1Z"
              fill="currentColor"
            />
          </svg>
        </span>
        <span className="text-[14px] font-medium text-[var(--ink)] tracking-tight">
          {businessName}
        </span>
      </div>

      {/* Home section */}
      <div className="px-3 pt-3">
        <p className="px-3 pb-1.5 text-[11px] font-sans font-medium text-[var(--ink-faint)]">
          Home
        </p>
        <nav className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href || pathname?.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between gap-2 rounded-[8px] px-3 py-2 text-[13px] font-sans transition-colors ${
                  active
                    ? "bg-[var(--surface-raised)] text-[var(--ink)] font-medium"
                    : "text-[var(--ink-muted)] hover:bg-[var(--surface-raised)]/60 hover:text-[var(--ink)]"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon size={16} strokeWidth={1.75} />
                  {item.label}
                </span>

                {item.href === "/dashboard" && rescueCount > 0 && (
                  <span className="flex items-center gap-1 rounded-full bg-[var(--urgent)]/15 px-2 py-0.5 font-mono text-[10px] font-medium text-[var(--urgent)]">
                    <Flame size={10} />
                    {rescueCount}
                  </span>
                )}
                {item.href === "/leads" && rescueCount > 0 && (
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-[var(--urgent)]"
                    title={`${rescueCount} leads need rescue`}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}