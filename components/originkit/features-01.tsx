"use client";

import "./breakpoints.css";
import "./process-01.css";
import "./features-01.css";
import { useState, type KeyboardEvent, type ReactNode } from "react";

type Feature = {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  preview: ReactNode;
};

/* --- icons (kept from the original package — generic, no missing assets) --- */

const RescueIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      opacity="0.2"
      d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9Z"
      fill="#1E1E1E"
    />
    <path
      d="M12 2.25a9.75 9.75 0 1 0 9.75 9.75A9.76 9.76 0 0 0 12 2.25Zm0 18a8.25 8.25 0 1 1 8.25-8.25A8.26 8.26 0 0 1 12 20.25Zm3.53-11.78-4.5 4.5a.75.75 0 0 1-1.06 0l-2-2a.75.75 0 1 1 1.06-1.06L10.5 11.44l3.97-3.97a.75.75 0 1 1 1.06 1.06Z"
      fill="#1E1E1E"
    />
  </svg>
);

const TaskIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      opacity="0.2"
      d="M19.5 4.5v15a.75.75 0 0 1-.75.75h-13.5a.75.75 0 0 1-.75-.75v-15a.75.75 0 0 1 .75-.75h13.5a.75.75 0 0 1 .75.75Z"
      fill="#1E1E1E"
    />
    <path
      d="M19.5 3h-3V2.25a.75.75 0 0 0-1.5 0V3h-6V2.25a.75.75 0 0 0-1.5 0V3h-3A1.5 1.5 0 0 0 3 4.5v15A1.5 1.5 0 0 0 4.5 21h15a1.5 1.5 0 0 0 1.5-1.5v-15A1.5 1.5 0 0 0 19.5 3ZM19.5 19.5h-15V9h15v10.5ZM19.5 7.5h-15V4.5h15V7.5Zm-3.97 5.03-4.5 4.5a.75.75 0 0 1-1.06 0l-2-2a.75.75 0 1 1 1.06-1.06l1.47 1.47 3.97-3.97a.75.75 0 1 1 1.06 1.06Z"
      fill="#1E1E1E"
    />
  </svg>
);

const ListIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      opacity="0.2"
      d="M20.25 6H3.75A.75.75 0 0 1 3 5.25V4.5a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 .75.75v.75a.75.75 0 0 1-.75.75Z"
      fill="#1E1E1E"
    />
    <path
      d="M20.25 3H3.75A1.5 1.5 0 0 0 2.25 4.5v.75A1.5 1.5 0 0 0 3.75 6.75h16.5a1.5 1.5 0 0 0 1.5-1.5V4.5A1.5 1.5 0 0 0 20.25 3Zm0 1.5v.75H3.75V4.5h16.5ZM6 9.75a.75.75 0 0 0-.75.75v.008a.75.75 0 0 0 .75.75.75.75 0 0 0 .75-.75V10.5A.75.75 0 0 0 6 9.75Zm3 .75h9a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1 0-1.5ZM6 14.25a.75.75 0 0 0-.75.75v.008a.75.75 0 0 0 .75.75.75.75 0 0 0 .75-.75V15a.75.75 0 0 0-.75-.75Zm3 .75h9a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1 0-1.5Z"
      fill="#1E1E1E"
    />
  </svg>
);

const ChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      opacity="0.2"
      d="M4.5 19.5h15v.75h-15v-.75Z"
      fill="#1E1E1E"
    />
    <path
      d="M20.25 18.75H4.5V4.5a.75.75 0 0 0-1.5 0v15a.75.75 0 0 0 .75.75h16.5a.75.75 0 0 0 0-1.5Z"
      fill="#1E1E1E"
    />
    <path
      d="M18 6.75a.75.75 0 0 0-.75.75v6a.75.75 0 0 0 1.5 0v-6a.75.75 0 0 0-.75-.75Zm-4.5 3a.75.75 0 0 0-.75.75v3a.75.75 0 0 0 1.5 0v-3a.75.75 0 0 0-.75-.75Zm-4.5-1.5a.75.75 0 0 0-.75.75v4.5a.75.75 0 0 0 1.5 0V9a.75.75 0 0 0-.75-.75Z"
      fill="#1E1E1E"
    />
  </svg>
);

/* --- preview mockups, replacing the missing meeting.png / planning.png /
   event.png / powerful-integration.png assets from the original package --- */

const RescueQueueMock = () => (
  <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-lg ring-1 ring-neutral-100">
    <div className="mb-3 flex items-center justify-between">
      <p className="text-sm font-semibold text-neutral-900">Rescue Queue</p>
      <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700">
        3 need attention
      </span>
    </div>
    <div className="space-y-2">
      {[
        { name: "Priya Nair", wait: "26h no contact", color: "bg-orange-500" },
        { name: "Marcus Diallo", wait: "Just arrived", color: "bg-blue-500" },
        { name: "Elena Torres", wait: "18h no contact", color: "bg-amber-400" },
      ].map((l) => (
        <div key={l.name} className="flex items-center justify-between rounded-xl bg-neutral-50 px-3 py-2.5">
          <div className="flex items-center gap-2.5">
            <span className={`h-2 w-2 rounded-full ${l.color}`} />
            <span className="text-sm font-medium text-neutral-800">{l.name}</span>
          </div>
          <span className="text-xs text-neutral-400">{l.wait}</span>
        </div>
      ))}
    </div>
  </div>
);

const AutoTaskMock = () => (
  <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-lg ring-1 ring-neutral-100">
    <p className="mb-3 text-sm font-semibold text-neutral-900">New follow-up task</p>
    <div className="flex items-center gap-3 rounded-xl bg-emerald-50 px-3.5 py-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        ✓
      </span>
      <div>
        <p className="text-sm font-medium text-neutral-900">Call Priya Nair</p>
        <p className="text-xs text-neutral-500">Auto-created · due in 24h</p>
      </div>
    </div>
    <p className="mt-3 text-xs text-neutral-400">Created automatically the instant the lead came in — no setup needed.</p>
  </div>
);

const LeadListMock = () => (
  <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-lg ring-1 ring-neutral-100">
    <p className="mb-3 text-sm font-semibold text-neutral-900">All leads</p>
    <div className="space-y-1.5 text-sm">
      {[
        ["Priya Nair", "HOT"],
        ["Marcus Diallo", "NEW"],
        ["Elena Torres", "CONTACTED"],
        ["Sam Okafor", "CONVERTED"],
      ].map(([name, status]) => (
        <div key={name} className="flex items-center justify-between rounded-lg px-2.5 py-1.5 hover:bg-neutral-50">
          <span className="font-medium text-neutral-800">{name}</span>
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-500">
            {status}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const AnalyticsMock = () => (
  <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-lg ring-1 ring-neutral-100">
    <p className="mb-3 text-sm font-semibold text-neutral-900">Conversion rate</p>
    <div className="flex items-end gap-2 h-24">
      {[40, 65, 50, 80, 60, 90].map((h, i) => (
        <div key={i} className="flex-1 rounded-t-md bg-orange-400/80" style={{ height: `${h}%` }} />
      ))}
    </div>
    <p className="mt-3 text-xs text-neutral-400">Leads by source, status, and conversion — always current.</p>
  </div>
);

const FEATURES: Feature[] = [
  {
    id: "rescue",
    title: "Rescue Queue",
    description: "Surfaces every HOT lead front and center",
    icon: <RescueIcon />,
    preview: <RescueQueueMock />,
  },
  {
    id: "tasks",
    title: "Auto follow-up tasks",
    description: "A 24-hour task, created instantly",
    icon: <TaskIcon />,
    preview: <AutoTaskMock />,
  },
  {
    id: "leads",
    title: "Full lead management",
    description: "List, search, filter, and track",
    icon: <ListIcon />,
    preview: <LeadListMock />,
  },
  {
    id: "analytics",
    title: "Dashboard analytics",
    description: "Leads by source, status, conversion",
    icon: <ChartIcon />,
    preview: <AnalyticsMock />,
  },
];

const CARD_SHADOW =
  "shadow-[0_4px_4px_rgba(121,85,13,0.05),0_1px_1px_rgba(125,125,125,0.15),0_55px_33px_rgba(166,166,166,0.05),0_24px_24px_rgba(166,166,166,0.09),0_6px_13px_rgba(166,166,166,0.1)]";

const ACTIVE_TAB_SHADOW =
  "shadow-[0_5px_7px_rgba(4,139,240,0.05),0_5px_5px_rgba(22,26,29,0.05),0_1px_1px_rgba(22,26,29,0.15)]";

const FeatureTabVisual = ({
  feature,
  variant,
}: {
  feature: Feature;
  variant: "idle" | "active";
}) => {
  const isActive = variant === "active";

  return (
    <>
      <span
        className={`flex size-10 shrink-0 items-center justify-center overflow-clip rounded-lg border border-solid p-2 ${
          isActive
            ? "border-[#90d7f3] bg-white"
            : "border-[#e5e5e5] bg-linear-to-r from-white to-[#f2f2f2]"
        }`}
      >
        <span className="relative flex size-6 items-center justify-center overflow-clip [&_svg]:max-h-full [&_svg]:max-w-full">
          {feature.icon}
        </span>
      </span>

      <span className="flex min-w-0 flex-col gap-1.25">
        <span className="text-[16px] font-medium leading-[1.1] tracking-[-0.01em] text-[#1e1e1e] iphone:text-base">
          {feature.title}
        </span>
        <span
          className={`text-[13px] font-medium leading-[1.1] tracking-[-0.01em] iphone:text-[13px] ${
            isActive ? "text-[#4c6a75]" : "text-[#60605d]"
          }`}
        >
          {feature.description}
        </span>
      </span>
    </>
  );
};

const FeatureTabs = ({
  activeId,
  onSelect,
  onKeyDown,
}: {
  activeId: string;
  onSelect: (id: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
}) => {
  return (
    <div
      role="tablist"
      aria-label="Product features"
      aria-orientation="vertical"
      onKeyDown={onKeyDown}
      className="relative flex w-full shrink-0 flex-col gap-2.5 py-1 pl-0 ipad-landscape:w-90.25 ipad-landscape:gap-3 ipad-landscape:py-1 ipad-landscape:pl-1"
    >
      {FEATURES.map((feature) => {
        const isActive = activeId === feature.id;
        const hoverClass = isActive
          ? ""
          : "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-[#f7f9fb]";

        return (
          <button
            key={feature.id}
            type="button"
            role="tab"
            id={`feature-tab-${feature.id}`}
            aria-selected={isActive}
            aria-controls="feature-preview"
            tabIndex={isActive ? 0 : -1}
            onClick={() => onSelect(feature.id)}
            className={`relative z-0 flex w-full min-h-11 min-w-0 cursor-pointer items-center gap-3 overflow-clip rounded-xl border border-solid p-3 text-left touch-manipulation transition-[background-color,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e1e1e] motion-reduce:transition-none ${hoverClass} ${
              isActive
                ? `border-[#9bd3e9] bg-[#bce7f8] ${ACTIVE_TAB_SHADOW}`
                : "border-transparent bg-white"
            }`}
          >
            <FeatureTabVisual feature={feature} variant={isActive ? "active" : "idle"} />
          </button>
        );
      })}
    </div>
  );
};

const FeaturePreview = ({ activeId }: { activeId: string }) => {
  const activeFeature = FEATURES.find((f) => f.id === activeId) ?? FEATURES[0];

  return (
    <div
      id="feature-preview"
      role="tabpanel"
      aria-labelledby={`feature-tab-${activeId}`}
      className="relative aspect-[1018/570] w-full min-w-0 flex-1 overflow-clip rounded-[17px] border border-solid border-[#dfe1e2] ipad-landscape:aspect-auto ipad-landscape:min-h-0"
      style={{
        backgroundImage:
          "linear-gradient(135deg, #fffcf5 0%, #fdfdfd 32%, #f7fcff 68%, #f0f8ff 100%)",
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: "radial-gradient(circle, #c8cedd 1px, transparent 1px)",
          backgroundSize: "11px 11px",
        }}
      />

      <div className="absolute inset-0 z-10 flex items-center justify-center p-3 iphone:p-4 ipad-landscape:p-5">
        <div
          key={activeFeature.id}
          className="flex h-full w-full items-center justify-center animate-hero-reveal motion-reduce:animate-none [animation-duration:500ms] [animation-timing-function:cubic-bezier(0.23,1,0.32,1)]"
        >
          {activeFeature.preview}
        </div>
      </div>
    </div>
  );
};

const Features01 = () => {
  const [activeId, setActiveId] = useState("rescue");

  const handleSelectFeature = (nextId: string) => {
    if (nextId === activeId) return;
    setActiveId(nextId);
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = FEATURES.findIndex((f) => f.id === activeId);
    if (currentIndex < 0) return;

    let nextIndex = currentIndex;

    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      nextIndex = (currentIndex + 1) % FEATURES.length;
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      nextIndex = (currentIndex - 1 + FEATURES.length) % FEATURES.length;
    } else if (event.key === "Home") {
      event.preventDefault();
      nextIndex = 0;
    } else if (event.key === "End") {
      event.preventDefault();
      nextIndex = FEATURES.length - 1;
    } else {
      return;
    }

    const nextId = FEATURES[nextIndex].id;
    handleSelectFeature(nextId);
    document.getElementById(`feature-tab-${nextId}`)?.focus();
  };

  return (
    <main className="min-h-screen bg-white text-[#010110] flex items-center justify-center">
      <section
        aria-labelledby="features-heading"
        className="relative mx-auto my-[8px] flex w-full max-w-[97dvw] flex-col items-center overflow-clip rounded-3xl px-4 py-16 sm:px-6 sm:py-20 ipad:px-10 ipad:py-24 laptop:px-[clamp(2rem,10vw,13.8rem)] laptop:py-25"
        style={{
          backgroundImage:
            "linear-gradient(135deg, #fffcf5 0%, #fdfdfd 40%, #f7fcff 100%)",
        }}
      >
        <div className="relative z-10 flex w-full flex-col items-center gap-10 ipad:gap-15">
          <header className="flex w-full max-w-180 flex-col items-center gap-3 text-center">
            <h1
              id="features-heading"
              className="animate-section-rise text-wrap text-[clamp(2rem,4vw,2.5rem)] font-medium leading-[1.12] tracking-[-0.04em] text-[#010110] motion-reduce:animate-none [animation-delay:0ms]"
            >
              Everything you need, nothing you don&apos;t
            </h1>
            <p className="animate-section-rise max-w-155 text-pretty text-[16px] font-medium leading-normal tracking-[-0.02em] text-[#45545e] iphone:text-base motion-reduce:animate-none [animation-delay:80ms]">
              Built for owners who need follow-up handled, not another
              dashboard to babysit.
            </p>
          </header>

          <div
            className={`animate-section-rise flex w-full max-w-237.5 flex-col gap-5 overflow-clip rounded-3xl bg-white p-3 motion-reduce:animate-none [animation-delay:160ms] ${CARD_SHADOW} ipad-landscape:flex-row ipad-landscape:items-stretch ipad-landscape:gap-5`}
          >
            <FeatureTabs
              activeId={activeId}
              onSelect={handleSelectFeature}
              onKeyDown={handleTabKeyDown}
            />

            <FeaturePreview activeId={activeId} />
          </div>
        </div>
      </section>
    </main>
  );
};

export default Features01;
