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
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      {/* Business / logo */}
      <div className="flex h-16 items-center gap-2 px-5">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 1L9.8 6.2L15 8L9.8 9.8L8 15L6.2 9.8L1 8L6.2 6.2L8 1Z"
              fill="currentColor"
            />
          </svg>
        </span>
        <span className="text-[15px] font-semibold tracking-[-0.2px]">
          {businessName}
        </span>
      </div>

      {/* Home section */}
      <div className="px-3 pt-2">
        <p className="px-3 pb-1 text-[12px] font-medium text-muted-foreground">
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
                className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-[14px] transition ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon size={17} strokeWidth={1.75} />
                  {item.label}
                </span>

                {item.href === "/dashboard" && rescueCount > 0 && (
                  <span className="flex items-center gap-1 rounded-full bg-orange-500/15 px-2 py-0.5 text-[11px] font-semibold text-orange-500">
                    <Flame size={10} />
                    {rescueCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}