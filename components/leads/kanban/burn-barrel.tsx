"use client";

import React, { useState } from "react";
import { Trash2, Flame } from "lucide-react";

interface BurnBarrelProps {
  onDiscardLead: (leadId: string) => void;
}

export function BurnBarrel({ onDiscardLead }: BurnBarrelProps) {
  const [active, setActive] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setActive(true);
  };

  const handleDragLeave = () => {
    setActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData("cardId");
    if (cardId) {
      onDiscardLead(cardId);
    }
    setActive(false);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`flex flex-col items-center justify-center rounded-[12px] border p-6 min-w-[200px] w-56 shrink-0 h-[calc(100vh-14rem)] transition-all select-none ${
        active
          ? "border-[var(--urgent)] bg-[var(--urgent)]/15 text-[var(--urgent)] ring-2 ring-[var(--urgent)]/40 scale-[1.02] shadow-xl"
          : "border-dashed border-[var(--hairline)] bg-[var(--surface)]/50 text-[var(--ink-muted)] hover:border-[var(--hairline)]/80"
      }`}
    >
      <div className="flex flex-col items-center justify-center gap-2.5 text-center">
        {active ? (
          <div className="relative">
            <Flame className="size-10 animate-bounce text-[var(--urgent)] drop-shadow-md" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--urgent)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--urgent)]"></span>
            </span>
          </div>
        ) : (
          <div className="p-3 rounded-full bg-[var(--surface-raised)] border border-[var(--hairline)] text-[var(--ink-faint)]">
            <Trash2 className="size-6" />
          </div>
        )}

        <div className="space-y-1">
          <p
            className={`text-xs font-medium font-sans ${
              active ? "text-[var(--urgent)] font-semibold" : "text-[var(--ink-muted)]"
            }`}
          >
            {active ? "Release to Discard" : "Burn Barrel"}
          </p>
          <p className="text-[11px] text-[var(--ink-faint)] max-w-[140px] leading-tight">
            {active ? "Lead will be archived as Lost" : "Drag card here to discard lead"}
          </p>
        </div>
      </div>
    </div>
  );
}
