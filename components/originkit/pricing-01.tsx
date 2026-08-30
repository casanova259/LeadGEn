// Adapted from Originkit pricing-01 for Lost Leads · stack: nextjs · styling: tailwind
"use client";

import "./pricing-01.css";
import { useLayoutEffect, useRef } from "react";
import {
  BillingCycleControl,
  useBillingCycle,
} from "@/components/originkit/ui/pricing-01/billing-toggle";

const PRICE_SUFFIX_EASE = "cubic-bezier(.215,.61,.355,1)";

type PricingPlan = {
  name: string;
  description: string;
  icon: React.ReactNode;
  monthlyPrice: number;
  yearlyPrice: number;
  buttonLabel: string;
  buttonHref: string;
  isPopular?: boolean;
  emphasizedFeature?: string;
  features: string[];
};

/**
 * The original package pointed each plan/benefit icon at SVG files
 * (basic.svg, pro.svg, enterprise.svg, check.svg, calendar.svg, card.svg,
 * database.svg) that weren't included in the zip. Rebuilt inline below so
 * nothing renders as a broken image.
 */
const StarterIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" className="size-12">
    <rect width="48" height="48" rx="12" fill="#f2ede9" />
    <path d="M24 12v24M14 22l10-10 10 10" stroke="#111" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

const GrowthIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" className="size-12">
    <rect width="48" height="48" rx="12" fill="#f2ede9" />
    <path d="M24 13l2.7 6.9 7.3.6-5.6 4.8 1.8 7.2-6.2-3.9-6.2 3.9 1.8-7.2-5.6-4.8 7.3-.6L24 13Z" fill="#111" />
  </svg>
);

const ScaleIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" className="size-12">
    <rect width="48" height="48" rx="12" fill="#f2ede9" />
    <path d="M14 34V20m10 14V14m10 20v-9" stroke="#111" strokeWidth="2.2" strokeLinecap="round" fill="none" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 14 14" fill="none" className="size-3.5 shrink-0">
    <path d="M2 7.3l3.2 3.2L12 3.3" stroke="#111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="size-6">
    <rect x="3.5" y="5" width="17" height="15" rx="2.5" stroke="#111" strokeWidth="1.6" fill="none" />
    <path d="M3.5 9.5h17M8 3v3.4M16 3v3.4" stroke="#111" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const CardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="size-6">
    <rect x="3" y="6" width="18" height="12" rx="2" stroke="#111" strokeWidth="1.6" fill="none" />
    <path d="M3 10h18" stroke="#111" strokeWidth="1.6" />
  </svg>
);

const DatabaseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="size-6">
    <ellipse cx="12" cy="6" rx="7.5" ry="3" stroke="#111" strokeWidth="1.6" fill="none" />
    <path d="M4.5 6v12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6" stroke="#111" strokeWidth="1.6" fill="none" />
    <path d="M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3" stroke="#111" strokeWidth="1.6" fill="none" />
  </svg>
);

/**
 * Pulled straight from the existing Lost Leads pricing section. Yearly
 * figures assume a "2 months free" annual discount (10x monthly, shown as an
 * annual total) since the original monthly-only pricing didn't specify a
 * yearly rate — adjust these three numbers if you want a different discount.
 */
const PRICING_PLANS: PricingPlan[] = [
  {
    name: "Starter",
    description: "For solo owners just getting follow-up under control.",
    icon: <StarterIcon />,
    monthlyPrice: 49,
    yearlyPrice: 490,
    buttonLabel: "Start free trial",
    buttonHref: "/sign-up",
    features: [
      "Up to 100 leads/mo",
      "1 location",
      "Rescue Queue + auto tasks",
      "Daily email digest",
    ],
  },
  {
    name: "Growth",
    description:
      "The sweet spot for most small teams — rescue 2–3 deals a month and it pays for itself.",
    icon: <GrowthIcon />,
    monthlyPrice: 99,
    yearlyPrice: 990,
    buttonLabel: "Start free trial",
    buttonHref: "/sign-up",
    isPopular: true,
    emphasizedFeature: "Everything in Starter",
    features: [
      "Up to 500 leads/mo",
      "Up to 3 locations",
      "Everything in Starter",
      "Full analytics dashboard",
    ],
  },
  {
    name: "Scale",
    description: "For multi-location businesses with higher lead volume.",
    icon: <ScaleIcon />,
    monthlyPrice: 199,
    yearlyPrice: 1990,
    buttonLabel: "Talk to us",
    buttonHref: "/contact",
    emphasizedFeature: "Everything in Growth",
    features: [
      "Unlimited leads",
      "Unlimited locations",
      "Everything in Growth",
      "Priority support",
    ],
  },
];

const BENEFITS = [
  { icon: <CalendarIcon />, label: "14-day free trial" },
  { icon: <CardIcon />, label: "No credit card required" },
  { icon: <DatabaseIcon />, label: "Cancel anytime" },
] as const;

const CARD_OUTLINE_SHADOW =
  "shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06),0px_2px_4px_0px_rgba(0,0,0,0.04)]";

const CARD_SURFACE_SHADOW = "shadow-xs";

const PriceRow = ({
  monthlyPrice,
  yearlyPrice,
  isYearly,
}: {
  monthlyPrice: number;
  yearlyPrice: number;
  isYearly: boolean;
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const suffixRef = useRef<HTMLSpanElement>(null);
  const previousOffset = useRef<{ x: number; y: number } | null>(null);
  const clearAnimationRef = useRef<(() => void) | null>(null);

  const readOffset = () => {
    const row = rowRef.current;
    const suffix = suffixRef.current;
    if (!row || !suffix) return null;

    const rowRect = row.getBoundingClientRect();
    const suffixRect = suffix.getBoundingClientRect();

    return {
      x: suffixRect.left - rowRect.left,
      y: suffixRect.top - rowRect.top,
    };
  };

  useLayoutEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    const syncOffset = () => {
      clearAnimationRef.current?.();
      previousOffset.current = readOffset();
    };

    const observer = new ResizeObserver(syncOffset);
    observer.observe(row);
    window.addEventListener("resize", syncOffset);
    syncOffset();

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", syncOffset);
      clearAnimationRef.current?.();
    };
  }, []);

  useLayoutEffect(() => {
    const suffix = suffixRef.current;
    if (!suffix) return;

    const offset = readOffset();
    if (!offset) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const prev = previousOffset.current;

    clearAnimationRef.current?.();

    if (prev !== null && !prefersReducedMotion) {
      const deltaX = prev.x - offset.x;
      const deltaY = prev.y - offset.y;
      const sameRow = Math.abs(deltaY) < 1;

      if (sameRow && Math.abs(deltaX) > 0.5) {
        suffix.style.willChange = "transform";
        suffix.style.transform = `translateX(${deltaX}px)`;
        suffix.style.transition = "none";
        suffix.getBoundingClientRect();
        suffix.style.transition = `transform 200ms ${PRICE_SUFFIX_EASE}`;
        suffix.style.transform = "translateX(0)";

        const handleEnd = (event: TransitionEvent) => {
          if (event.propertyName !== "transform") return;
          suffix.style.willChange = "auto";
          suffix.style.transition = "";
          suffix.style.transform = "";
          suffix.removeEventListener("transitionend", handleEnd);
          clearAnimationRef.current = null;
        };

        clearAnimationRef.current = () => {
          suffix.removeEventListener("transitionend", handleEnd);
          suffix.style.willChange = "auto";
          suffix.style.transition = "";
          suffix.style.transform = "";
          clearAnimationRef.current = null;
        };

        suffix.addEventListener("transitionend", handleEnd);
      }
    }

    previousOffset.current = offset;
  }, [isYearly]);

  const priceClassName = `col-start-1 row-start-1 font-switzer text-[clamp(30px,9vw,2.625rem)] font-semibold tabular-nums leading-none tracking-[-0.04em] will-change-[opacity] transition-opacity duration-200 ease-[cubic-bezier(.215,.61,.355,1)] motion-reduce:transition-none`;

  return (
    <div
      ref={rowRef}
      className="flex flex-wrap items-end gap-x-2 gap-y-0.5 iphone:flex-nowrap"
    >
      <span
        className="relative inline-grid justify-items-start"
        aria-live="polite"
      >
        <span
          aria-hidden="true"
          className="invisible col-start-1 row-start-1 font-switzer text-[clamp(30px,9vw,2.625rem)] font-semibold tabular-nums leading-none tracking-[-0.04em]"
        >
          ${Math.max(monthlyPrice, yearlyPrice)}
        </span>
        <span
          aria-hidden={isYearly}
          className={`${priceClassName} ${
            isYearly ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
        >
          ${monthlyPrice}
        </span>
        <span
          aria-hidden={!isYearly}
          className={`${priceClassName} ${
            isYearly ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          ${yearlyPrice}
        </span>
      </span>
      <span
        ref={suffixRef}
        className="flex items-baseline text-[15px] font-medium leading-normal text-[#4d4d4d] will-change-transform iphone:text-[17px]"
      >
        <span className="whitespace-nowrap">per month /&nbsp;</span>
        <span className="relative inline-grid justify-items-start">
          <span
            aria-hidden="true"
            className="invisible col-start-1 row-start-1 whitespace-nowrap"
          >
            yearly
          </span>
          <span
            aria-hidden={isYearly}
            className={`col-start-1 row-start-1 whitespace-nowrap will-change-[opacity] transition-opacity duration-200 ease-[cubic-bezier(.215,.61,.355,1)] motion-reduce:transition-none ${
              isYearly ? "pointer-events-none opacity-0" : "opacity-100"
            }`}
          >
            month
          </span>
          <span
            aria-hidden={!isYearly}
            className={`col-start-1 row-start-1 whitespace-nowrap will-change-[opacity] transition-opacity duration-200 ease-[cubic-bezier(.215,.61,.355,1)] motion-reduce:transition-none ${
              isYearly ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            yearly
          </span>
        </span>
      </span>
    </div>
  );
};

const Pricing01 = () => {
  const { isYearly, toggleBillingCycle } = useBillingCycle();

  return (
    <main
      id="pricing"
      className="min-h-screen bg-[#f4f1f0] px-4 py-16 text-[#111] sm:px-6 sm:py-24"
    >
      <section
        aria-labelledby="pricing-heading"
        className="mx-auto flex w-full max-w-7xl flex-col items-center gap-10"
      >
        <header className="flex max-w-101.25 lg:max-w-205 flex-col items-center gap-4 text-center">
          <span className="rounded-full bg-white px-2.5 py-2 text-base font-medium leading-none shadow-[0px_1px_0.5px_rgba(0,0,0,0.1)]">
            Pricing &amp; Plans
          </span>
          <div className="flex flex-col items-center gap-3.5">
            <h1
              id="pricing-heading"
              className="font-switzer font-semibold leading-[1.2] tracking-[-0.04em] text-[clamp(30px,4vw,52px)]"
            >
              Simple pricing that pays for itself
            </h1>

            <p className="max-w-155 text-[17px] font-medium leading-6.5 text-[#3d3d3d] sm:text-lg">
              If Lost Leads rescues 2–3 deals a month, it&apos;s already worth
              more than it costs.
            </p>
          </div>
        </header>

        <BillingCycleControl
          isYearly={isYearly}
          onChange={toggleBillingCycle}
        />

        <div className="mx-auto flex w-full max-w-4xl desktop-sm:max-w-none flex-col gap-10">
          <div className="flex w-full flex-wrap items-stretch justify-center gap-5">
            {PRICING_PLANS.map((plan) => {
              return (
                <article
                  key={plan.name}
                  className={`flex min-w-0 w-full flex-col rounded-[20px] bg-[#EAE4E2] ipad:max-w-[450px] ipad-landscape:max-w-90.5 ${CARD_OUTLINE_SHADOW} ${
                    plan.isPopular ? "border-2 border-transparent" : ""
                  }`}
                  style={
                    plan.isPopular
                      ? {
                          backgroundClip: "padding-box, border-box",
                          backgroundImage:
                            "linear-gradient(#EAE4E2, #EAE4E2), linear-gradient(90deg, #fe2e2e 0%, #f3661c 26%, #cf6954 44%, #a752a5 58%, #9348ce 70%, #c31bf6 88%, #e89ef4 100%)",
                          backgroundOrigin: "padding-box, border-box",
                        }
                      : undefined
                  }
                >
                  <div
                    className={`relative z-10 flex flex-col gap-8 bg-white p-5 ${CARD_SURFACE_SHADOW} android-sm:gap-9 android-sm:p-6 iphone:gap-10 iphone:p-7.5 ${
                      plan.isPopular
                        ? "-mx-0.5 -mt-0.5 rounded-[20px] rounded-b-[19px] pt-7 android-sm:pt-7.5 iphone:pt-8"
                        : "rounded-[19px]"
                    }`}
                  >
                    {plan.icon}

                    {plan.isPopular && (
                      <span className="absolute right-2.5 top-2.5 flex items-center justify-center rounded-[100px] bg-[#111] px-2 py-1 text-[14px] font-medium leading-normal whitespace-nowrap text-white iphone:px-2.5 iphone:py-1.5 iphone:text-base">
                        Most Popular
                      </span>
                    )}

                    <div className="flex flex-col gap-6 iphone:gap-7.5">
                      <div className="flex flex-col gap-0.5">
                        <h2 className="text-xl font-semibold leading-normal iphone:text-[22px]">
                          {plan.name}
                        </h2>
                        <p className="text-[15px] font-medium leading-normal text-[#4d4d4d] iphone:text-[17px]">
                          {plan.description}
                        </p>
                      </div>

                      <PriceRow
                        monthlyPrice={plan.monthlyPrice}
                        yearlyPrice={plan.yearlyPrice}
                        isYearly={isYearly}
                      />

                      <a
                        href={plan.buttonHref}
                        className="flex h-[59px] w-full cursor-pointer items-center justify-center rounded-lg border-t border-white/10 bg-[#111] px-6 text-center text-[17px] font-semibold leading-none text-white transition-colors duration-200 ease-[cubic-bezier(.215,.61,.355,1)] hover:bg-[#2a2a2a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111]"
                      >
                        {plan.buttonLabel}
                      </a>
                    </div>
                  </div>

                  <ul className="flex flex-1 flex-col gap-3 rounded-b-[18px] p-5 text-[15px] font-medium leading-normal android-sm:p-6 iphone:p-7.5 iphone:text-[17px]">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <CheckIcon />
                        <span
                          className={
                            feature === plan.emphasizedFeature
                              ? "font-semibold"
                              : undefined
                          }
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>

          <div className="w-full ipad-landscape:px-18.5">
            <div className="mx-auto flex w-full flex-col items-center gap-5 rounded-[10px] border border-[#dcd6d0] bg-[#E8E4E2] p-5 ipad:max-w-[450px] ipad-landscape:max-w-none ipad-landscape:flex-row ipad-landscape:items-center ipad-landscape:justify-between ipad-landscape:gap-12.5 ipad-landscape:py-2.5 ipad-landscape:px-5">
              <p className="text-center text-[16px] font-medium leading-normal text-[#1a1a1a] ipad-landscape:text-left">
                Every plan includes a{" "}
                <br className="ipad-landscape:hidden" />
                <span
                  className="bg-clip-text font-semibold text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(89.99999752581606deg, rgb(255, 47, 47) 0%, rgb(239, 123, 22) 36.277%, rgb(138, 67, 225) 69.752%, rgb(213, 17, 253) 100%)",
                  }}
                >
                  14-day free trial
                </span>
              </p>
              <a
                href="/sign-up"
                className="min-h-10 shrink-0 cursor-pointer rounded-md bg-white px-3.5 py-2.5 text-center text-[15px] font-semibold leading-none text-[#111] shadow-[0px_1px_0.5px_rgba(0,0,0,0.08)] transition-colors duration-200 ease-[cubic-bezier(.215,.61,.355,1)] hover:bg-[#f5f3f1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111]"
              >
                Start free trial
              </a>
            </div>
          </div>

          <div className="flex w-full flex-col items-center gap-7.5">
            <ul className="flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-5 sm:gap-y-3">
              {BENEFITS.map((benefit, index) => (
                <li key={benefit.label} className="flex items-center gap-5">
                  {index > 0 && (
                    <span
                      aria-hidden="true"
                      className="hidden size-1 rounded-full bg-[#d3cbc5] sm:block"
                    />
                  )}
                  <span className="flex items-center gap-1.5">
                    {benefit.icon}
                    <span className="text-[17px] font-medium leading-normal">
                      {benefit.label}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Pricing01;
