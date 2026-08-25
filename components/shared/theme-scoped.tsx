"use client";

import { useEffect } from "react";

/**
 * Applies `dark` to <html> for as long as this component is mounted
 * (i.e. while the user is inside the (app) route group), then removes
 * it on unmount so the marketing site stays light.
 *
 * This has to live on <html>, not a wrapping <div>, because Radix
 * portals (Select/Popover/Tooltip content) render as direct children
 * of <body> — a `dark` class on an inner div never reaches them.
 */
export function ThemeScope() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, []);

  return null;
}