"use client";

import Link from "next/link";
import { useState } from "react";

/* ---------------------------------------------------------------------- */
/* Design tokens (from Cal.com-design-analysis spec)                      */
/* ink:#111111  body:#374151  muted:#6b7280  hairline:#e5e7eb            */
/* surface-card:#f5f5f5  surface-soft:#f8f9fa  surface-dark:#101010      */
/* on-dark-soft:#a1a1aa  badge-orange:#fb923c                            */
/* rounded: md=8px(lg) lg=12px(xl) xl=16px(2xl) pill/full=9999px         */
/* section spacing = 96px = py-24                                        */
/* ---------------------------------------------------------------------- */

const NAV_TABS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#features", label: "Product" },
  { href: "#pricing", label: "Pricing" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Lead arrives",
    body: "From your website form, WhatsApp, Instagram, Facebook, or email — it lands in Lost Leads the moment it comes in.",
  },
  {
    step: "02",
    title: "Follow-up task auto-created",
    body: "No one has to remember. A 24-hour follow-up task is created automatically the second the lead is logged.",
  },
  {
    step: "03",
    title: "You contact them",
    body: "The task shows up on your Tasks page and in your daily digest email, so it's impossible to miss.",
  },
  {
    step: "04",
    title: "Converted or lost",
    body: "Update the status in one click. It feeds straight into your dashboard analytics.",
  },
];

const FEATURES = [
  {
    title: "Rescue Queue",
    body: "Surfaces every HOT, NEW, and 24h+ untouched lead front and center on your dashboard.",
    tag: null as string | null,
  },
  {
    title: "Auto follow-up tasks",
    body: "Every new lead gets a 24-hour task the instant it's created. Zero setup per lead.",
    tag: null,
  },
  {
    title: "Full lead management",
    body: "List, search, filter, detail view, and status tracking for every lead you've ever logged.",
    tag: null,
  },
  {
    title: "Dashboard analytics",
    body: "Leads by source, status distribution, and conversion rate — at a glance, always current.",
    tag: null,
  },
  {
    title: "Daily email digest",
    body: "A morning summary of exactly what needs your attention, delivered to your inbox.",
    tag: null,
  },
  {
    title: "Multi-source capture",
    body: "Connect the channels leads actually come from — website, WhatsApp, Instagram, Facebook, email.",
    tag: "Coming soon",
  },
];

const AUDIENCES = [
  {
    id: "clinics",
    label: "Clinics",
    body: "A missed inquiry is a patient who books with the practice down the street instead.",
    stat: "of patient inquiries go to whoever replies first",
    statValue: "68%",
  },
  {
    id: "salons",
    label: "Salons",
    body: "New-client requests go cold fast — the first business to reply usually wins the booking.",
    stat: "of first-time bookings come from a same-day reply",
    statValue: "3 in 4",
  },
  {
    id: "agencies",
    label: "Agencies",
    body: "Inbound leads from ads and referrals are expensive to earn and easy to lose in a shared inbox.",
    stat: "average cost of a paid-ad lead that goes cold unanswered",
    statValue: "$40+",
  },
  {
    id: "realestate",
    label: "Real estate",
    body: "Buyers and renters move on to the next listing the moment they feel ignored.",
    stat: "of buyers contact the first agent who responds",
    statValue: "50%",
  },
];

const PRICING = [
  {
    name: "Starter",
    price: "$49",
    period: "/mo",
    description: "For solo owners just getting follow-up under control.",
    features: [
      "Up to 100 leads/mo",
      "1 location",
      "Rescue Queue + auto tasks",
      "Daily email digest",
    ],
    cta: "Start free trial",
    featured: false,
  },
  {
    name: "Growth",
    price: "$99",
    period: "/mo",
    description:
      "The sweet spot for most small teams — rescue 2–3 deals a month and it pays for itself.",
    features: [
      "Up to 500 leads/mo",
      "Up to 3 locations",
      "Everything in Starter",
      "Full analytics dashboard",
    ],
    cta: "Start free trial",
    featured: true,
  },
  {
    name: "Scale",
    price: "$199",
    period: "/mo",
    description: "For multi-location businesses with higher lead volume.",
    features: [
      "Unlimited leads",
      "Unlimited locations",
      "Everything in Growth",
      "Priority support",
    ],
    cta: "Talk to us",
    featured: false,
  },
];

const FAQS = [
  {
    q: "How is this different from a spreadsheet or my inbox?",
    a: "A spreadsheet doesn't remind you to follow up, and an inbox buries leads under everything else. Lost Leads auto-creates a follow-up task the moment a lead arrives and surfaces anyone you haven't contacted in 24 hours — so nothing depends on you remembering.",
  },
  {
    q: "Does it integrate with WhatsApp, Instagram, or Facebook?",
    a: "Website form capture and email are live today. WhatsApp and a public capture API are on the roadmap and coming soon — reach out if you want early access.",
  },
  {
    q: "What happens if I don't follow up in time?",
    a: "The lead moves into your Rescue Queue on the dashboard, and it's called out in your daily digest email until you take action.",
  },
  {
    q: "Can I use it for multiple locations?",
    a: "Yes — the Growth and Scale plans support multiple locations under one account.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes, every plan starts with a 14-day free trial. No credit card required.",
  },
  {
    q: "How long does setup take?",
    a: "Most businesses are logging leads within a few minutes — connect your website form and you're live.",
  },
];

/* ---------------------------------------------------------------------- */
/* Small components                                                       */
/* ---------------------------------------------------------------------- */

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#e5e7eb] py-5">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <span className="text-[16px] font-semibold text-[#111111]">{q}</span>
        <span
          className={`shrink-0 text-xl leading-none text-[#6b7280] transition-transform ${
            open ? "rotate-45" : ""
          }`}
        >
          +
        </span>
      </button>
      {open && (
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[#374151]">
          {a}
        </p>
      )}
    </div>
  );
}

function LogoMark() {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#111111] text-white">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M8 1L9.8 6.2L15 8L9.8 9.8L8 15L6.2 9.8L1 8L6.2 6.2L8 1Z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}

/* ---------------------------------------------------------------------- */
/* Page                                                                    */
/* ---------------------------------------------------------------------- */

export default function LandingPage() {
  const [activeAudience, setActiveAudience] = useState(AUDIENCES[0].id);
  const audience = AUDIENCES.find((a) => a.id === activeAudience)!;

  return (
    <div className="min-h-screen bg-white text-[#111111]">
      {/* TOP NAV */}
      <header className="sticky top-0 z-50 h-16 border-b border-[#f3f4f6] bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <LogoMark />
            <span className="text-[15px] font-semibold tracking-[-0.3px]">
              Lost Leads
            </span>
          </Link>

          {/* nav-pill-group */}
          <nav className="hidden items-center gap-1 rounded-full bg-[#f8f9fa] p-1.5 md:flex">
            {NAV_TABS.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className="rounded-lg px-3.5 py-1.5 text-[14px] font-medium text-[#6b7280] transition hover:bg-white hover:text-[#111111] hover:shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
              >
                {tab.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="hidden text-[14px] font-medium text-[#111111] sm:block"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="flex h-10 items-center rounded-lg bg-[#111111] px-5 text-[14px] font-semibold text-white transition hover:bg-[#242424]"
            >
              Sign up free
            </Link>
          </div>
        </div>
      </header>

      {/* HERO BAND */}
      <section className="mx-auto max-w-[1200px] px-6 py-24 lg:px-8">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#f5f5f5] px-3 py-1 text-[13px] font-medium text-[#111111]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#fb923c]" />
              A hot lead goes cold every 24 hours you wait
            </span>

            <h1 className="mt-6 text-[44px] font-semibold leading-[1.05] tracking-[-1.5px] text-[#111111] sm:text-[56px] sm:tracking-[-2px] lg:text-[64px]">
              Stop losing leads you already paid for.
            </h1>

            <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-[#374151]">
              Lost Leads catches every new inquiry, opens a follow-up task
              automatically, and flags anyone you haven&apos;t contacted in
              24 hours — before they book with someone else.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/sign-up"
                className="flex h-10 items-center rounded-lg bg-[#111111] px-5 text-[14px] font-semibold text-white transition hover:bg-[#242424]"
              >
                Try it free for 14 days
              </Link>
              <Link
                href="#pricing"
                className="flex h-10 items-center rounded-lg border border-[#e5e7eb] bg-white px-5 text-[14px] font-semibold text-[#111111] transition hover:bg-[#f8f9fa]"
              >
                See pricing
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-2">
                {["#fb923c", "#ec4899", "#8b5cf6", "#34d399"].map((c, i) => (
                  <span
                    key={i}
                    className="h-9 w-9 rounded-full border-2 border-white"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <span className="text-[14px] text-[#6b7280]">
                Built for clinics, salons, agencies &amp; real estate teams
              </span>
            </div>
          </div>

          {/* hero-app-mockup-card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
              <div className="mb-5 flex items-center justify-between">
                <p className="text-[15px] font-semibold text-[#111111]">
                  Rescue Queue
                </p>
                <span className="rounded-full bg-[#f5f5f5] px-2.5 py-1 text-[12px] font-semibold text-[#111111]">
                  3 need attention
                </span>
              </div>

              <div className="space-y-2">
                {[
                  {
                    name: "Priya Nair",
                    source: "Website form",
                    wait: "26h no contact",
                    color: "#fb923c",
                  },
                  {
                    name: "Marcus Diallo",
                    source: "Instagram DM",
                    wait: "Just arrived",
                    color: "#3b82f6",
                  },
                  {
                    name: "Elena Torres",
                    source: "Referral",
                    wait: "18h no contact",
                    color: "#f59e0b",
                  },
                ].map((lead) => (
                  <div
                    key={lead.name}
                    className="flex items-center justify-between rounded-xl bg-[#f8f9fa] p-3.5"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: lead.color }}
                      />
                      <div>
                        <p className="text-[14px] font-medium text-[#111111]">
                          {lead.name}
                        </p>
                        <p className="text-[12px] text-[#6b7280]">
                          {lead.source}
                        </p>
                      </div>
                    </div>
                    <span className="text-[12px] font-medium text-[#898989]">
                      {lead.wait}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center gap-2.5 rounded-xl bg-[#f5f5f5] px-4 py-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#10b981]/15 text-[#10b981]">
                  ✓
                </span>
                <p className="text-[12px] font-medium leading-snug text-[#374151]">
                  Follow-up task created automatically for Priya
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LOGO STRIP */}
      <section className="border-t border-[#f3f4f6]">
        <div className="mx-auto max-w-[1200px] px-6 py-10 lg:px-8">
          <p className="mb-6 text-center text-[13px] font-medium uppercase tracking-widest text-[#898989]">
            Trusted by teams who can&apos;t afford to lose a lead
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {[
              "Bloom Dental",
              "Northside Realty",
              "Studio Verve",
              "Clearline Legal",
              "Aster Med Spa",
            ].map((name) => (
              <span
                key={name}
                className="text-[17px] font-semibold tracking-[-0.3px] text-[#e5e7eb]"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM / AGITATION — feature-icon-card style */}
      <section className="py-24">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-[36px] font-semibold leading-[1.15] tracking-[-1px] text-[#111111]">
              Most leads don&apos;t get lost. They get forgotten.
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-[#374151]">
              Leads land in a form inbox, a DM, a missed call — then buried
              under everything else you&apos;re doing that day.
            </p>
          </div>

          <div className="mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              { value: "2–3", label: "deals a month lost by the average small business to forgotten follow-up" },
              { value: "24h+", label: "is how long a hot lead typically sits untouched before it goes cold" },
              { value: "5+", label: "channels leads come in from — easy to lose track across" },
            ].map((s) => (
              <div
                key={s.value}
                className="rounded-xl border border-[#e5e7eb] bg-white p-6"
              >
                <p className="text-[36px] font-semibold tracking-[-1px] text-[#111111]">
                  {s.value}
                </p>
                <p className="mt-2 text-[14px] leading-relaxed text-[#6b7280]">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          <p className="mx-auto mt-10 max-w-md text-center text-[17px] font-semibold text-[#111111]">
            Lost Leads closes that gap automatically.
          </p>
        </div>
      </section>

      {/* HOW IT WORKS — product-mockup-card */}
      <section id="how-it-works" className="border-t border-[#f3f4f6] py-24">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-[36px] font-semibold leading-[1.15] tracking-[-1px] text-[#111111]">
              How it works
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-[#374151]">
              One loop, running quietly in the background of every lead you
              get.
            </p>
          </div>

          <div className="mt-16 rounded-xl border border-[#e5e7eb] bg-white p-8">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {HOW_IT_WORKS.map((step) => (
                <div key={step.step}>
                  <p className="text-[13px] font-semibold text-[#fb923c]">
                    {step.step}
                  </p>
                  <h3 className="mt-3 text-[18px] font-semibold tracking-[0] text-[#111111]">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-[#6b7280]">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mx-auto mt-8 max-w-2xl rounded-xl bg-[#f5f5f5] p-6 text-center">
            <p className="text-[14px] font-medium text-[#111111]">
              If nobody touches a hot lead in 24 hours, it lands in the
              Rescue Queue — front and center on your dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURE GRID — feature-card (gray) */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-[36px] font-semibold leading-[1.15] tracking-[-1px] text-[#111111]">
              Everything you need, nothing you don&apos;t
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-[#374151]">
              Built for owners who need follow-up handled, not another
              dashboard to babysit.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-xl bg-[#f5f5f5] p-8"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-[18px] font-semibold text-[#111111]">
                    {f.title}
                  </h3>
                  {f.tag && (
                    <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[#6b7280]">
                      {f.tag}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-[14px] leading-relaxed text-[#374151]">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHO IT'S FOR — nav-pill-group tabs + product-mockup-card */}
      <section className="border-t border-[#f3f4f6] py-24">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-[36px] font-semibold leading-[1.15] tracking-[-1px] text-[#111111]">
              Built for businesses that live or die by response time
            </h2>
          </div>

          {/* nav-pill-group */}
          <div className="mx-auto mt-10 flex w-fit flex-wrap justify-center gap-1 rounded-full bg-[#f8f9fa] p-1.5">
            {AUDIENCES.map((a) => (
              <button
                key={a.id}
                onClick={() => setActiveAudience(a.id)}
                className={`rounded-lg px-4 py-2 text-[14px] font-medium transition ${
                  activeAudience === a.id
                    ? "bg-white text-[#111111] shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                    : "text-[#6b7280] hover:text-[#111111]"
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>

          <div className="mx-auto mt-10 max-w-2xl rounded-xl border border-[#e5e7eb] bg-white p-8 text-center">
            <p className="text-[17px] leading-relaxed text-[#374151]">
              {audience.body}
            </p>
            <div className="mx-auto mt-6 w-fit rounded-full bg-[#f5f5f5] px-4 py-2">
              <span className="text-[14px] font-medium text-[#111111]">
                <span className="font-semibold text-[#fb923c]">
                  {audience.statValue}
                </span>{" "}
                {audience.stat}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-[36px] font-semibold leading-[1.15] tracking-[-1px] text-[#111111]">
              Simple pricing that pays for itself
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-[#374151]">
              If Lost Leads rescues 2–3 deals a month, it&apos;s already
              worth more than it costs.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-3">
            {PRICING.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-xl p-8 ${
                  tier.featured
                    ? "bg-[#101010] text-white"
                    : "border border-[#e5e7eb] bg-white text-[#111111]"
                }`}
              >
                {tier.featured && (
                  <span className="mb-4 inline-block rounded-full bg-[#fb923c] px-3 py-1 text-[12px] font-semibold text-white">
                    Most popular
                  </span>
                )}
                <h3 className="text-[22px] font-semibold tracking-[-0.3px]">
                  {tier.name}
                </h3>
                <p className="mt-4 flex items-baseline gap-1">
                  <span className="text-[28px] font-semibold tracking-[-0.5px]">
                    {tier.price}
                  </span>
                  <span
                    className={`text-[14px] font-medium ${
                      tier.featured ? "text-[#a1a1aa]" : "text-[#6b7280]"
                    }`}
                  >
                    {tier.period}
                  </span>
                </p>
                <p
                  className={`mt-3 text-[14px] leading-relaxed ${
                    tier.featured ? "text-[#a1a1aa]" : "text-[#6b7280]"
                  }`}
                >
                  {tier.description}
                </p>

                <ul className="mt-6 space-y-3">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[14px]">
                      <span className="text-[#10b981]">✓</span>
                      <span
                        className={
                          tier.featured ? "text-[#e5e7eb]" : "text-[#374151]"
                        }
                      >
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/sign-up"
                  className={`mt-8 flex h-10 items-center justify-center rounded-lg px-5 text-[14px] font-semibold transition ${
                    tier.featured
                      ? "bg-white text-[#111111] hover:bg-[#e5e7eb]"
                      : "bg-[#111111] text-white hover:bg-[#242424]"
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-[14px] text-[#6b7280]">
            14-day free trial on every plan. No credit card required.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-[#f3f4f6] py-24">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <h2 className="text-center text-[36px] font-semibold leading-[1.15] tracking-[-1px] text-[#111111]">
            Questions, answered
          </h2>
          <div className="mt-12">
            {FAQS.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA BAND LIGHT */}
      <section className="py-24">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
          <div className="rounded-xl bg-[#f5f5f5] px-8 py-12 text-center">
            <h2 className="text-[28px] font-semibold leading-[1.2] tracking-[-0.5px] text-[#111111]">
              Your next lead is already waiting.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-[#6b7280]">
              Set up takes minutes. The first hot lead you rescue pays for
              the month.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/sign-up"
                className="flex h-10 items-center rounded-lg bg-[#111111] px-5 text-[14px] font-semibold text-white transition hover:bg-[#242424]"
              >
                Try Lost Leads free
              </Link>
              <Link
                href="#pricing"
                className="flex h-10 items-center rounded-lg border border-[#e5e7eb] bg-white px-5 text-[14px] font-semibold text-[#111111] transition hover:bg-[#f8f9fa]"
              >
                See pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER — the only other dark surface besides the featured tier */}
      <footer className="bg-[#101010] py-16 text-[#a1a1aa]">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-[#101010]">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M8 1L9.8 6.2L15 8L9.8 9.8L8 15L6.2 9.8L1 8L6.2 6.2L8 1Z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
                <span className="text-[14px] font-semibold text-white">
                  Lost Leads
                </span>
              </div>
              <p className="mt-3 text-[13px] leading-relaxed">
                Never lose a follow-up again.
              </p>
            </div>

            <div>
              <p className="text-[13px] font-semibold text-white">Product</p>
              <ul className="mt-3 space-y-2 text-[13px]">
                <li>
                  <Link href="#features" className="hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="hover:text-white">
                    How it works
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-white">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-[13px] font-semibold text-white">Company</p>
              <ul className="mt-3 space-y-2 text-[13px]">
                <li>
                  <Link href="#faq" className="hover:text-white">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-[13px] font-semibold text-white">Get started</p>
              <ul className="mt-3 space-y-2 text-[13px]">
                <li>
                  <Link href="/sign-up" className="hover:text-white">
                    Sign up free
                  </Link>
                </li>
                <li>
                  <Link href="/sign-in" className="hover:text-white">
                    Sign in
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-white/10 pt-6">
            <p className="text-[13px]">
              © {new Date().getFullYear()} Lost Leads. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}