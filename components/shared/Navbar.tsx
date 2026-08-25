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
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-8 text-foreground">
      <h1 className="text-[18px] font-semibold tracking-[-0.2px]">{resolvedTitle}</h1>

      <div className="flex items-center gap-3">
        {resolvedQuickCreateHref && (
          <Link
            href={resolvedQuickCreateHref}
            className="flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-[13px] font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            <Plus size={14} strokeWidth={2.5} />
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