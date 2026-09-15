"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

type RouteConfig = {
  title: string;
  quickCreateHref?: string;
  quickCreateLabel?: string;
};

const ROUTE_CONFIG: Record<string, RouteConfig> = {
  "/dashboard": { title: "Dashboard" },
  "/leads": {
    title: "Leads",
    quickCreateHref: "/leads/new",
    quickCreateLabel: "New Lead",
  },
  "/kanbanleads": {
    title: "Pipeline",
    quickCreateHref: "/leads/new",
    quickCreateLabel: "New Lead",
  },
  "/tasks": { title: "Tasks" },
  "/settings": { title: "Settings" },
};

function resolveConfig(pathname: string | null): RouteConfig {
  if (!pathname) return { title: "Lost Leads" };
  const match = Object.keys(ROUTE_CONFIG).find(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
  return match ? ROUTE_CONFIG[match] : { title: "Lost Leads" };
}

export function Navbar({
  title,
  quickCreateHref,
  quickCreateLabel = "Quick Create",
}: {
  title?: string;
  quickCreateHref?: string;
  quickCreateLabel?: string;
}) {
  const pathname = usePathname();
  const routeConfig = resolveConfig(pathname);

  const resolvedTitle = title ?? routeConfig.title;
  const resolvedQuickCreateHref = quickCreateHref ?? routeConfig.quickCreateHref;
  const resolvedQuickCreateLabel =
    quickCreateHref ? quickCreateLabel : routeConfig.quickCreateLabel ?? quickCreateLabel;

  return (
    <header className="flex h-16 items-center justify-between border-b border-[var(--hairline)] bg-[var(--surface)] px-8 text-[var(--ink)]">
      <span className="font-heading text-[17px] font-normal text-[var(--ink)] tracking-tight">{resolvedTitle}</span>

      <div className="flex items-center gap-3">
        {resolvedQuickCreateHref && (
          <Link
            href={resolvedQuickCreateHref}
            className="flex h-8 items-center gap-1.5 rounded-[8px] bg-[var(--accent-blue)] px-3 text-[13px] font-sans font-medium text-[#0C0E11] transition hover:bg-[var(--accent-blue)]/90"
          >
            <Plus size={13} strokeWidth={2.5} />
            {resolvedQuickCreateLabel}
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