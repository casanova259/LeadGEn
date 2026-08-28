// Adapted from Originkit hero-01 for Lost Leads · stack: nextjs · styling: tailwind
"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import SpotlightReveal from "@/components/originkit/ui/hero-01/spotlight-reveal";
import TrustedBy from "@/components/originkit/ui/hero-01/trusted-by";

const easeOutCubic = [0.215, 0.61, 0.355, 1] as const;

/**
 * The original OriginKit package points TRUSTED_LOGOS at SVG files that
 * weren't included in the delivered zip (logo-2.svg, logo-3.svg, logo-4.svg).
 * Rather than leave broken <img> tags, we generate simple text-wordmark SVGs
 * on the fly (as data URIs) using your real customer names from the existing
 * Lost Leads page. TrustedBy itself is untouched — it just receives
 * different `src` values.
 */
function textLogoDataUri(label: string) {
  const charWidth = 8.4;
  const width = Math.max(60, Math.round(label.length * charWidth));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="22" viewBox="0 0 ${width} 22"><text x="0" y="16" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="700" fill="#1a1a1a">${label}</text></svg>`;
  return { src: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`, width, height: 22 };
}

const TRUSTED_NAMES = [
  "Bloom Dental",
  "Northside Realty",
  "Studio Verve",
  "Clearline Legal",
  "Aster Med Spa",
];

const TRUSTED_LOGOS = TRUSTED_NAMES.map((name) => ({
  alt: name,
  ...textLogoDataUri(name),
})) as const;

/** Inline replacement for the missing logo-mark.svg — the real Lost Leads mark. */
const LogoMark = () => (
  <svg width="24" height="24" viewBox="0 0 16 16" fill="none" className="size-5 ipad:size-6">
    <path d="M8 1L9.8 6.2L15 8L9.8 9.8L8 15L6.2 9.8L1 8L6.2 6.2L8 1Z" fill="#000002" />
  </svg>
);

/** Inline replacement for the missing annotation-arrow.svg — a simple hand-drawn-style curve. */
const AnnotationArrow = () => (
  <svg width="27" height="78" viewBox="0 0 27 78" fill="none" className="lg:h-19.5 lg:w-6.75 h-13.5 w-4.5 max-w-none">
    <path
      d="M13 2C8 20 3 45 13 76"
      stroke="#144a58"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
    <path d="M6 68L13 76L19 66" stroke="#144a58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

const Annotation = () => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -top-6.5 -left-41.25 hidden h-35 w-63.25 select-none md:block"
    >
      <div className="absolute top-5.75 left-18.25 flex h-9 w-20 items-center justify-center">
        <div className="-scale-y-100 rotate-[83.54deg]">
          <AnnotationArrow />
        </div>
      </div>

      <p className="absolute lg:bottom-10 bottom-12 -left-10 lg:-left-20 flex w-53 rotate-[-10.6deg] flex-col justify-center text-center text-[12px] lg:text-[18px] leading-tight tracking-[-0.02em] text-[#144a58]">
        <span>Try it free</span>
        <span>for 14 days</span>
      </p>
    </div>
  );
};

const MenuIcon = () => {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="size-4.5"
    >
      <path
        d="M2.25 4.5h13.5M2.25 9h13.5M2.25 13.5h13.5"
        stroke="white"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
};

/**
 * The original BrowserPreview rendered dashboard-preview.png / mobile-dashboard.png,
 * neither of which was included in the zip. Rather than show broken images, the
 * browser-chrome frame now hosts a live mockup of the actual Rescue Queue card
 * that's already on your current landing page, so the preview is real, not a
 * placeholder image. The video-play button is dropped since there's no video.
 */
const RESCUE_LEADS = [
  { name: "Priya Nair", source: "Website form", wait: "26h no contact", color: "bg-orange-500" },
  { name: "Marcus Diallo", source: "Instagram DM", wait: "Just arrived", color: "bg-blue-500" },
  { name: "Elena Torres", source: "Referral", wait: "18h no contact", color: "bg-amber-400" },
];

const RescueQueuePreview = () => (
  <div className="relative overflow-hidden rounded-[5.5px] ipad:rounded-[9.5px] bg-linear-to-b from-orange-50 via-white to-neutral-50 p-6 sm:p-8">
    <div className="mb-5 flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full bg-neutral-200" />
      <span className="h-2.5 w-2.5 rounded-full bg-neutral-200" />
      <span className="h-2.5 w-2.5 rounded-full bg-neutral-200" />
    </div>

    <div className="mb-4 flex items-center justify-between">
      <p className="text-sm font-semibold text-neutral-900">Rescue Queue</p>
      <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700">
        3 need attention
      </span>
    </div>

    <div className="space-y-2.5">
      {RESCUE_LEADS.map((lead) => (
        <div
          key={lead.name}
          className="flex items-center justify-between rounded-2xl bg-white p-3.5 ring-1 ring-neutral-100"
        >
          <div className="flex items-center gap-3">
            <span className={`h-2 w-2 shrink-0 rounded-full ${lead.color}`} />
            <div>
              <p className="text-sm font-medium text-neutral-900">{lead.name}</p>
              <p className="text-xs text-neutral-500">{lead.source}</p>
            </div>
          </div>
          <span className="text-xs font-medium text-neutral-400">{lead.wait}</span>
        </div>
      ))}
    </div>

    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 z-1 h-24 bg-linear-to-t from-[#f4f0e8] from-0% via-[#f4f0e8]/85 via-30% to-transparent ipad:h-28 laptop:h-32"
    />
  </div>
);

const BrowserPreview = ({ active }: { active: boolean }) => {
  const prefersReducedMotion = useReducedMotion();

  const hidden = prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 48 };
  const visible = prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 };

  return (
    <motion.div
      className="relative mx-auto mt-4 -mb-18 w-full min-w-0 max-w-4xl self-center will-change-transform ipad:mb-0 ipad:mt-6 laptop:mt-8"
      initial={hidden}
      animate={active ? visible : hidden}
      transition={{
        type: "tween",
        duration: prefersReducedMotion ? 0.2 : 0.45,
        ease: easeOutCubic,
      }}
    >
      <div className="translate-y-6 rounded-[14px] bg-[#f4f0e8] p-[8.5px] shadow-[0_0_6px_1px_rgba(0,0,0,0.05),0_0_200px_rgba(0,0,0,0.08),0_15px_20px_-17px_rgba(0,0,0,0.13),0_7px_14px_-10px_rgba(0,0,0,0.08)] ipad:translate-y-14 ipad:rounded-[18px]">
        <RescueQueuePreview />
      </div>
    </motion.div>
  );
};

const SlideIn = ({
  active,
  children,
  className,
  y = 20,
  duration = 0.3,
  onComplete,
}: {
  active: boolean;
  children: React.ReactNode;
  className?: string;
  y?: number;
  duration?: number;
  onComplete?: () => void;
}) => {
  const prefersReducedMotion = useReducedMotion();
  const doneRef = useRef(false);

  const hidden = prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y };
  const visible = prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 };

  return (
    <motion.div
      className={className}
      initial={hidden}
      animate={active ? visible : hidden}
      transition={{
        type: "tween",
        duration: prefersReducedMotion ? 0.2 : duration,
        ease: easeOutCubic,
      }}
      onAnimationComplete={() => {
        if (!active || doneRef.current) return;
        doneRef.current = true;
        onComplete?.();
      }}
    >
      {children}
    </motion.div>
  );
};

const Hero01Content = () => {
  const prefersReducedMotion = useReducedMotion();
  const navDoneRef = useRef(false);

  const [showHero, setShowHero] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [showCtas, setShowCtas] = useState(false);
  const [showTrusted, setShowTrusted] = useState(false);

  // Reduced-motion visibility is derived directly from the media query on
  // every render instead of being mirrored into state inside a useEffect.
  // That avoids the "setState in effect" cascading-render lint (and the
  // extra render pass it causes) while still reaching full visibility
  // immediately for reduced-motion users.
  const heroVisible = showHero || !!prefersReducedMotion;
  const descriptionVisible = showDescription || !!prefersReducedMotion;
  const ctasVisible = showCtas || !!prefersReducedMotion;
  const trustedVisible = showTrusted || !!prefersReducedMotion;

  const handleNavComplete = () => {
    if (navDoneRef.current || prefersReducedMotion) return;
    navDoneRef.current = true;
    setShowHero(true);
  };

  const handleSpotlightComplete = () => {
    if (prefersReducedMotion) return;
    setShowDescription(true);
  };

  const handleDescriptionComplete = () => {
    if (prefersReducedMotion) return;
    setShowCtas(true);
    setShowTrusted(true);
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-white px-3 pt-2.5 text-[#010110]">
      <section
        aria-labelledby="lostleads-hero-heading"
        className="relative mx-auto w-full overflow-hidden md:rounded-[10px] bg-linear-to-b from-orange-50 via-white to-neutral-50 bg-cover bg-center pb-0 rounded-[10px] ipad:pb-10 desktop-sm:min-h-200"
      >
        <div className="relative z-10 flex w-full flex-col items-center px-3 pt-3 ipad:px-4 ipad:pt-4">
          <motion.header
            className="flex w-full max-w-150.5 items-center justify-between gap-2 rounded-full border border-white bg-white px-2.5 py-1.5 shadow-[0_0_0.5px_rgba(0,0,0,0.5)] ipad:gap-3 ipad:px-3 ipad:py-2"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -28 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{
              type: "tween",
              duration: prefersReducedMotion ? 0.2 : 0.3,
              ease: easeOutCubic,
            }}
            onAnimationComplete={handleNavComplete}
          >
            <a
              href="#main"
              className="flex shrink-0 items-center gap-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#010110] ipad:gap-1.5"
              aria-label="Lost Leads home"
            >
              <LogoMark />
              <span className="font-geist text-[1.125rem] font-medium leading-none text-black ipad:text-[1.35rem]">
                Lost Leads
              </span>
            </a>

            <nav aria-label="Primary" className="flex items-center gap-3 ipad:gap-6">
              <a
                href="/sign-in"
                className="text-sm font-medium leading-none text-[#363636] transition-colors duration-200 ease focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#010110] ipad:text-[15px] [@media(hover:hover)_and_(pointer:fine)]:hover:text-black"
              >
                Sign in
              </a>

              <a
                href="/sign-up"
                className="relative hidden min-h-11 items-center justify-center overflow-clip rounded-[41px] border border-solid border-[#57565f] px-5 py-3 text-center text-[15px] font-medium leading-[19.6px] text-white transition-[opacity,transform] duration-200 ease focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#010110] active:scale-[0.96] motion-reduce:active:scale-100 ipad:inline-flex [@media(hover:hover)_and_(pointer:fine)]:hover:opacity-90"
                style={{
                  boxShadow:
                    "0 4px 7.7px rgba(0,0,0,0.05), 0 10px 24px rgba(0,0,0,0.05), 0 24px 40.8px rgba(0,0,0,0.15), 0 25px 18.7px rgba(0,0,0,0.05), 0 52px 41.4px rgba(0,0,0,0.05)",
                }}
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-[41px]"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, #000002, #000002), radial-gradient(ellipse 170px 258px at 50% -198px, rgba(237,239,255,0.71) 0%, rgba(237,239,255,0) 100%), linear-gradient(123.39deg, #1f1f21 0%, #3e3d4c 34%, #1f1f21 51%, #3e3d4c 72%, #1f1f21 100%)",
                  }}
                />
                <span className="relative">Start free</span>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-[41px] shadow-[inset_0_5px_8px_rgba(255,255,255,0.05),inset_0_1px_1px_rgba(255,255,255,0.25)]"
                />
              </a>

              <button
                type="button"
                aria-label="Open menu"
                className="inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#111] text-white shadow-[0_4px_12px_rgba(0,0,0,0.18)] transition-[opacity,transform] duration-200 ease focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#010110] active:scale-[0.96] motion-reduce:active:scale-100 ipad:hidden [@media(hover:hover)_and_(pointer:fine)]:hover:opacity-90"
              >
                <MenuIcon />
              </button>
            </nav>
          </motion.header>

          <div
            id="main"
            className="mt-15.5 flex w-full max-w-162.75 scroll-mt-24 flex-col items-center gap-7 text-center iphone:mt-12 ipad:mt-16 ipad:gap-10 laptop:mt-31.5"
          >
            <div className="flex w-full flex-col items-center gap-3 ipad:gap-3.5">
              <SpotlightReveal
                id="lostleads-hero-heading"
                text="Stop losing leads you already paid for."
                blur={6}
                delay={0}
                active={heroVisible}
                onComplete={handleSpotlightComplete}
                className="text-[32px] md:text-[44px] lg:text-[56px] font-medium leading-[1.15] tracking-[-0.02em] text-wrap text-[#010110] [text-shadow:0_5px_5px_rgba(0,0,0,0.05),0_1px_1px_rgba(0,0,0,0.16),0_1px_1px_rgba(255,255,255,0.6)] ipad:leading-[1.1]"
              />
              <SlideIn
                active={descriptionVisible}
                y={16}
                duration={0.3}
                onComplete={handleDescriptionComplete}
                className="max-w-118.75 will-change-transform"
              >
                <p className="px-1 text-[clamp(15px,2.5vw,16px)] font-medium leading-normal tracking-[-0.02em] text-pretty text-[#45545e] ipad:px-0">
                  Lost Leads catches every new inquiry, opens a follow-up task
                  automatically, and flags anyone you haven&apos;t contacted in
                  24 hours — before they book with someone else.
                </p>
              </SlideIn>
            </div>

            <SlideIn
              active={ctasVisible}
              y={20}
              duration={0.3}
              className="relative flex w-full flex-col items-stretch gap-3 will-change-transform ipad:w-auto ipad:flex-row ipad:items-center ipad:justify-center ipad:gap-5"
            >
              <Annotation />
              <a
                href="/sign-up"
                className="relative inline-flex min-h-11.5 w-full shrink-0 items-center justify-center overflow-clip rounded-full border-3 border-solid border-[#3E3E3E] bg-linear-to-b from-[#292929] to-[#111] py-3.5 pr-5 pl-4.75 text-center text-[clamp(15px,2.5vw,16px)] font-medium leading-[1.1] tracking-[-0.01em] text-white transition-[opacity,transform] duration-200 ease focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#010110] active:scale-[0.96] motion-reduce:active:scale-100 ipad:w-auto [@media(hover:hover)_and_(pointer:fine)]:hover:opacity-90"
              >
                Try it free for 14 days
              </a>
              <a
                href="#pricing"
                className="relative inline-flex min-h-11.5 w-full shrink-0 items-center justify-center rounded-full border-3 border-solid border-white bg-linear-to-b from-[#f4f4f4] to-[#fefefe] py-3.5 pr-5 pl-4.75 text-center text-[clamp(15px,2.5vw,16px)] font-medium leading-[1.1] tracking-[-0.01em] text-[#161616] shadow-[0_0_0.225px_rgba(0,0,0,0.07),0_0_0.225px_rgba(0,0,0,0.05),0_2.698px_2.923px_-1.349px_rgba(0,0,0,0.25),0_0.899px_3.598px_0.899px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.14),inset_0_-1px_1px_rgba(0,0,0,0.06)] transition-[transform,box-shadow,opacity] duration-200 ease focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#010110] active:scale-[0.96] motion-reduce:transition-none motion-reduce:active:scale-100 motion-reduce:hover:translate-y-0 ipad:w-auto [@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-0.5 [@media(hover:hover)_and_(pointer:fine)]:hover:opacity-95 [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[0_0_0.225px_rgba(0,0,0,0.08),0_0_0.225px_rgba(0,0,0,0.06),0_4px_8px_-2px_rgba(0,0,0,0.22),0_2px_6px_1px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.14),inset_0_-1px_1px_rgba(0,0,0,0.06)]"
              >
                See pricing
              </a>
            </SlideIn>
          </div>

          <BrowserPreview active={heroVisible} />
        </div>
      </section>
      <div className="relative z-10 mt-0 flex flex-col items-center px-4 pt-13.5 md:pt-17.5 pb-12 ipad:px-6 ipad:pb-16 laptop:pb-20">
        <TrustedBy logos={TRUSTED_LOGOS} active={trustedVisible} />
      </div>
    </main>
  );
};

export default Hero01Content;