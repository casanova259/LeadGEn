"use client";

import * as React from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({
  className,
  size = 16,
  ...props
}: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <Loader2
      size={size}
      className={cn("animate-spin text-muted-foreground", className)}
      {...props}
    />
  );
}

export function StatusBadge({
  state,
  className,
}: {
  state: "loading" | "done";
  className?: string;
}) {
  if (state === "loading") {
    return (
      <span
        className={cn(
          "inline-flex size-4 items-center justify-center text-[var(--accent-blue)]",
          className
        )}
      >
        <Loader2 className="size-3.5 animate-spin" />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex size-4 items-center justify-center rounded-full bg-[var(--clear)]/15 text-[var(--clear)]",
        className
      )}
    >
      <Check className="size-3 stroke-[2.5]" />
    </span>
  );
}
