// Adapted from Originkit features-04 for Lost Leads · stack: nextjs · styling: tailwind
"use client";

import "./features-04.css";
import { FeatureCard, Plate, WideCard } from "@/components/originkit/ui/features-04/cards";
import { CornerBlocks } from "@/components/originkit/ui/features-04/corner-blocks";
import { EdgeDotBands } from "@/components/originkit/ui/features-04/edge-dot-bands";
import { GridColumns, GridRows } from "@/components/originkit/ui/features-04/grid-pattern";

function asset(file: string) {
  return `/originkit/features-04/${file}`;
}

/**
 * Lost Leads "Why" features band — five tiles that fold phone → tablet → desktop.
 *
 * Phone stacks all five. Tablet pairs Focus/stat beside Connect/stat with
 * Scale full width underneath. Desktop turns that into three equal columns and
 * Scale stretches beside the other two.
 */

/** Soft ellipse wash behind the heading on phone/tablet. */
const Glow = () => (
  <div
    aria-hidden
    className="pointer-events-none absolute top-[56px] left-[calc(50%-0.43px)] h-[957px] w-[492px] -translate-x-1/2 rounded-[50%] bg-[#f8f8f8] blur-[26px] ipad:top-[27px] ipad:left-[calc(50%+15.21px)] ipad:w-[689px] desktop-sm:hidden"
  />
);

/** Desktop wash — covers the grid below the heading. */
const DesktopGlow = () => (
  <>
    <div
      aria-hidden
      className="pointer-events-none absolute top-[-17px] left-1/2 hidden h-[267px] w-[660px] -translate-x-1/2 rounded-[50%] bg-[#f8f8f8] blur-[26px] desktop-sm:block"
    />
    <div
      aria-hidden
      className="pointer-events-none absolute top-[90px] left-[calc(50%+42px)] hidden h-[1052px] w-[calc(100%+298px)] -translate-x-1/2 rounded-[50%] bg-[#f8f8f8] blur-[26px] desktop-sm:block"
    />
  </>
);

const AVATARS = [
  { src: "/features-04/avatar-1.png", alt: "Customer avatar 1" },
  { src: "/features-04/avatar-2.png", alt: "Customer avatar 2" },
  { src: "/features-04/avatar-3.png", alt: "Customer avatar 3" },
];

/** Use the supplied SVG badge asset instead of a custom inline approximation. */
const FlameIcon = () => (
  <img
    src="/features-04/flame.svg"
    alt=""
    width={16}
    height={16}
    className="size-[16px] object-contain ipad:size-[18px]"
  />
);

/** Use the provided pie-chart asset instead of a custom inline approximation. */
const PieChartIcon = () => (
  <img
    src="/features-04/pie-chart.svg"
    alt=""
    width={24}
    height={24}
    className="size-[24px] shrink-0 object-contain"
  />
);

const FEATURES = {
  focus: {
    title: "Focus",
    body: "Keep every lead organized and see at a glance who needs a follow-up next, so nothing sits in an inbox unanswered.",
    art: {
      src: "/features-04/focus.png",
      alt: "An isometric cube rendered in ASCII characters",
      boxClassName: "h-[166px] w-[180px] ipad:h-[196px] ipad:w-[212px]",
      artClassName:
        "top-[-29.98px] left-[-30.13px] h-[242.3px] w-[242.3px] ipad:top-[-35.4px] ipad:left-[-35.49px] ipad:h-[285.4px] ipad:w-[285.4px]",
    },
  },
  connect: {
    title: "Connect",
    body: "Capture leads from your website, WhatsApp, Instagram, Facebook, and email — all landing in one place, automatically.",
    art: {
      src: "/features-04/connect.png",
      alt: "Interlocking isometric blocks rendered in ASCII characters",
      boxClassName: "h-[166px] w-[198px] ipad:h-[196px] ipad:w-[234px]",
      artClassName:
        "top-[-7.55px] left-[7.44px] h-[179.8px] w-[194.2px] ipad:top-[-8.91px] ipad:left-[8.79px] ipad:h-[212.3px] ipad:w-[229.5px]",
    },
  },
  scale: {
    title: "Scale",
    body: "From a single location to a multi-location team, Lost Leads grows with your business while keeping follow-up just as simple.",
    art: {
      src: "/features-04/scale.png",
      alt: "A rising staircase of isometric blocks rendered in ASCII characters",
      boxClassName:
        "h-[166px] w-[173px] ipad:h-[213px] ipad:w-[223px] desktop-sm:h-[271px] desktop-sm:w-[283px]",
      artClassName:
        "top-[-21.83px] left-[-60.63px] h-[209.8px] w-[279.7px] ipad:top-[-28.01px] ipad:left-[-78.15px] ipad:h-[269.2px] ipad:w-[360.5px] desktop-sm:top-[-35.64px] desktop-sm:left-[-99.18px] desktop-sm:h-[342.5px] desktop-sm:w-[457.5px]",
    },
  },
};

export const FeaturesWhy = () => (
  <section className="animate-hero-reveal relative w-full overflow-hidden bg-[#f5f5f2] desktop-sm:bg-[#f8f8f8]">
    <div className="relative mx-auto w-full overflow-hidden pt-[81px] ipad:pt-[127px] desktop-sm:pt-[63px] wide-lg:max-w-[1440px]">
      <GridRows />
      <GridColumns />
      <CornerBlocks />
      <Glow />
      <DesktopGlow />
      <EdgeDotBands />

      <div className="relative mx-auto flex w-[71.22%] max-w-[286.301px] flex-col items-center gap-[32px] pb-[81px] ipad:w-[80.51%] ipad:max-w-[599px] ipad:gap-[52px] ipad:pb-[104px] desktop-sm:w-[82.78%] desktop-sm:max-w-[1192px] desktop-sm:gap-[72px] desktop-sm:pb-[62px]">
        <header className="flex w-full flex-col items-center gap-[20px] ipad:w-[502px]">
          <div className="flex items-center gap-[8px] rounded-[100px] bg-[#efeff0] px-[14px] py-[12px]">
            <FlameIcon />
            <span className="font-tight text-[12px] leading-[1.2] font-medium tracking-[-0.24px] whitespace-nowrap text-black ipad:text-[14px] ipad:tracking-[-0.28px]">
              Why Lost Leads
            </span>
          </div>
          <div className="flex w-full flex-col items-center gap-[12px] text-center leading-[1.2] text-[#121212]">
            <h2 className="max-w-[282px] font-helvetica-neue text-[24px] tracking-[-0.48px] ipad:max-w-none ipad:text-[32px] ipad:tracking-[-0.64px]">
              Built Around How Leads Actually Get Lost.
            </h2>
            <p className="max-w-[238px] font-tight text-[16px] tracking-[-0.32px] opacity-60 ipad:max-w-none ipad:text-[18px] ipad:tracking-[-0.36px] ipad:whitespace-nowrap">
              Stay on top of every lead, connect your channels, and scale without losing anyone.
            </p>
          </div>
        </header>

        <div className="flex w-full flex-col gap-[12px] ipad:gap-[16px] desktop-sm:grid desktop-sm:grid-cols-3 desktop-sm:items-stretch">
          <div className="flex flex-col gap-[12px] ipad:flex-row ipad:items-center ipad:gap-[16px] desktop-sm:contents">
            <div className="flex flex-col gap-[12px] ipad:w-[286px] ipad:shrink-0 ipad:gap-[16px] desktop-sm:w-auto">
              <Plate innerClassName="h-[76px] items-center gap-[10px] px-[20px] py-[12px]">
                <div className="flex shrink-0 items-center">
                  {AVATARS.map((avatar, index) => (
                    <img
                      key={avatar.src}
                      src={avatar.src}
                      alt={avatar.alt}
                      width={32}
                      height={32}
                      className={`size-[32px] shrink-0 rounded-full desktop-sm:size-[42px] ${
                        index < AVATARS.length - 1
                          ? "mr-[-15.238px] desktop-sm:mr-[-20px]"
                          : ""
                      }`}
                    />
                  ))}
                </div>
                <p className="w-[132px] font-tight text-[10px] leading-[1.1] font-medium tracking-[-0.2px] text-black desktop-sm:w-auto desktop-sm:text-[16px] desktop-sm:leading-[1.2] desktop-sm:tracking-[-0.32px] desktop-sm:whitespace-nowrap">
                  Built for clinics, salons &amp; agencies
                </p>
              </Plate>

              <FeatureCard {...FEATURES.focus} />
            </div>

            <div className="flex flex-col gap-[12px] ipad:flex-1 ipad:gap-[16px]">
              <FeatureCard {...FEATURES.connect} />

              <Plate innerClassName="h-[76px] items-center gap-[12px] px-[20px] py-[12px]">
                <PieChartIcon />
                <p className="font-tight text-[16px] leading-[1.2] font-medium whitespace-nowrap text-black desktop-sm:text-[18px]">
                  A follow-up task for every lead
                </p>
              </Plate>
            </div>
          </div>

          <WideCard {...FEATURES.scale} />
        </div>
      </div>
    </div>
  </section>
);
