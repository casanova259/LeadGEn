"use client";

import React, { useEffect, useRef, useState } from "react";

interface LazySectionProps {
  children: React.ReactNode;
  minHeight?: string;
  rootMargin?: string;
}

/**
 * Defers rendering of below-the-fold heavy components (like WebGL canvases,
 * complex pricing grids, and FAQ accordions) until the user scrolls near them.
 * This completely prevents main-thread blocking during initial page load.
 */
export function LazySection({
  children,
  minHeight = "400px",
  rootMargin = "350px",
}: LazySectionProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (shouldRender) return;
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [shouldRender, rootMargin]);

  return (
    <div ref={containerRef} style={{ minHeight: shouldRender ? undefined : minHeight }}>
      {shouldRender ? children : null}
    </div>
  );
}
