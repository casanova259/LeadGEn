"use client";

import Link from "next/link";
import { useState } from "react";

const NAV_LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#features", label: "Product" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
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
    title: "Clinics",
    body: "A missed inquiry is a patient who books with the practice down the street instead.",
  },
  {
    title: "Salons",
    body: "New-client requests go cold fast — the first business to reply usually wins the booking.",
  },
  {
    title: "Agencies",
    body: "Inbound leads from ads and referrals are expensive to earn and easy to lose in a shared inbox.",
  },
  {
    title: "Real estate",
    body: "Buyers and renters move on to the next listing the moment they feel ignored.",
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
    highlighted: false,
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
    highlighted: true,
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
    highlighted: false,
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

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-neutral-200 py-5">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <span className="text-[15px] font-medium text-neutral-900">{q}</span>
        <span
          className={`shrink-0 text-xl leading-none text-neutral-400 transition-transform ${
            open ? "rotate-45" : ""
          }`}
        >
          +
        </span>
      </button>
      {open && (
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-600">
          {a}
        </p>
      )}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-neutral-950">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-neutral-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-950 text-white">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 1L9.8 6.2L15 8L9.8 9.8L8 15L6.2 9.8L1 8L6.2 6.2L8 1Z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span className="text-[15px] font-semibold tracking-tight">
              Lost Leads
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-neutral-600 md:flex">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-neutral-950">
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="hidden text-sm font-medium text-neutral-700 hover:text-neutral-950 sm:block"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-full bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              Start free
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-6 pt-14 lg:px-10">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-2 lg:items-center lg:gap-10">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
              </span>
              A hot lead goes cold every 24 hours you wait
            </div>

            <h1 className="text-[44px] font-black leading-[1.05] tracking-tight sm:text-[56px] lg:text-[60px]">
              Stop losing leads
              <br />
              you already paid for.
            </h1>

            <p className="mt-6 max-w-md text-[17px] leading-relaxed text-neutral-600">
              Lost Leads catches every new inquiry, opens a follow-up task
              automatically, and flags anyone you haven&apos;t contacted in
              24 hours — before they book with someone else.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/sign-up"
                className="rounded-full bg-neutral-950 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                Try it free for 14 days
              </Link>
              <Link
                href="#pricing"
                className="rounded-full bg-neutral-100 px-6 py-3.5 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-200"
              >
                See pricing
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-6 text-sm text-neutral-500">
              <div className="flex -space-x-2">
                {["#FDBA74", "#FCA5A5", "#93C5FD", "#86EFAC"].map((c, i) => (
                  <span
                    key={i}
                    className="h-8 w-8 rounded-full border-2 border-white"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <span>Built for clinics, salons, agencies &amp; real estate teams</span>
            </div>
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-b from-orange-50 via-white to-neutral-50 p-6 shadow-[0_1px_0_0_rgba(0,0,0,0.04)] ring-1 ring-neutral-200 sm:p-8">
              <div className="mb-5 flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-neutral-200" />
                <span className="h-2.5 w-2.5 rounded-full bg-neutral-200" />
                <span className="h-2.5 w-2.5 rounded-full bg-neutral-200" />
              </div>

              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-neutral-900">
                  Rescue Queue
                </p>
                <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700">
                  3 need attention
                </span>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    name: "Priya Nair",
                    source: "Website form",
                    wait: "26h no contact",
                    color: "bg-orange-500",
                  },
                  {
                    name: "Marcus Diallo",
                    source: "Instagram DM",
                    wait: "Just arrived",
                    color: "bg-blue-500",
                  },
                  {
                    name: "Elena Torres",
                    source: "Referral",
                    wait: "18h no contact",
                    color: "bg-amber-400",
                  },
                ].map((lead) => (
                  <div
                    key={lead.name}
                    className="flex items-center justify-between rounded-2xl bg-white p-3.5 ring-1 ring-neutral-100"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${lead.color}`}
                      />
                      <div>
                        <p className="text-sm font-medium text-neutral-900">
                          {lead.name}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {lead.source}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-neutral-400">
                      {lead.wait}
                    </span>
                  </div>
                ))}
              </div>

              <div className="absolute -right-3 -top-3 hidden w-[168px] rotate-2 rounded-2xl bg-neutral-950 p-4 text-white shadow-xl sm:block">
                <p className="text-xs text-neutral-400">Avg. response time</p>
                <p className="mt-1 text-2xl font-bold">
                  4.2<span className="text-sm font-medium">hrs</span>
                </p>
                <p className="mt-1 text-xs font-medium text-emerald-400">
                  ↓ 68% since Lost Leads
                </p>
              </div>

              <div className="absolute -bottom-4 left-4 flex max-w-[240px] items-center gap-2.5 rounded-2xl bg-white px-4 py-3 shadow-lg ring-1 ring-neutral-100 sm:left-8">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  ✓
                </span>
                <p className="text-xs font-medium leading-snug text-neutral-800">
                  Follow-up task created automatically for Priya
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LOGO STRIP */}
      <section className="mx-auto mt-24 max-w-7xl border-t border-neutral-100 px-6 py-10 lg:px-10">
        <p className="mb-6 text-center text-xs font-medium uppercase tracking-widest text-neutral-400">
          Trusted by teams who can&apos;t afford to lose a lead
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-neutral-400">
          {[
            "Bloom Dental",
            "Northside Realty",
            "Studio Verve",
            "Clearline Legal",
            "Aster Med Spa",
          ].map((name) => (
            <span
              key={name}
              className="text-lg font-semibold tracking-tight text-neutral-300"
            >
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* PROBLEM / AGITATION */}
      <section className="border-t border-neutral-100 bg-neutral-50 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
              Most leads don&apos;t get lost. They get forgotten.
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-neutral-600">
              Leads land in a form inbox, a DM, a missed call — then buried
              under everything else you&apos;re doing that day.
            </p>
          </div>

          <div className="mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-6 ring-1 ring-neutral-100">
              <p className="text-3xl font-black tracking-tight">2–3</p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                deals a month lost by the average small business to forgotten
                follow-up
              </p>
            </div>
            <div className="rounded-2xl bg-white p-6 ring-1 ring-neutral-100">
              <p className="text-3xl font-black tracking-tight">24h+</p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                is how long a hot lead typically sits untouched before it
                goes cold
              </p>
            </div>
            <div className="rounded-2xl bg-white p-6 ring-1 ring-neutral-100">
              <p className="text-3xl font-black tracking-tight">5+</p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                channels leads come in from — form, WhatsApp, IG, FB, email —
                easy to lose track across
              </p>
            </div>
          </div>

          <p className="mx-auto mt-10 max-w-md text-center text-[17px] font-medium text-neutral-900">
            Lost Leads closes that gap automatically.
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
              How it works
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-neutral-600">
              One loop, running quietly in the background of every lead you
              get.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step}>
                <p className="text-sm font-bold text-orange-500">
                  {step.step}
                </p>
                <h3 className="mt-3 text-lg font-semibold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                  {step.body}
                </p>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-16 max-w-2xl rounded-2xl border border-orange-100 bg-orange-50 p-6 text-center">
            <p className="text-sm font-medium text-orange-900">
              If nobody touches a hot lead in 24 hours, it lands in the
              Rescue Queue — front and center on your dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURE GRID */}
      <section id="features" className="border-t border-neutral-100 bg-neutral-50 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
              Everything you need, nothing you don&apos;t
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-neutral-600">
              Built for owners who need follow-up handled, not another
              dashboard to babysit.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl bg-white p-6 ring-1 ring-neutral-100"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-semibold tracking-tight">
                    {f.title}
                  </h3>
                  {f.tag && (
                    <span className="shrink-0 rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-semibold text-neutral-500">
                      {f.tag}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
              Built for businesses that live or die by response time
            </h2>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {AUDIENCES.map((a) => (
              <div
                key={a.title}
                className="rounded-2xl border border-neutral-100 p-6"
              >
                <h3 className="text-base font-semibold tracking-tight">
                  {a.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                  {a.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="border-t border-neutral-100 bg-neutral-50 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
              Simple pricing that pays for itself
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-neutral-600">
              If Lost Leads rescues 2–3 deals a month, it&apos;s already
              worth more than it costs.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-3">
            {PRICING.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-2xl p-8 ${
                  tier.highlighted
                    ? "bg-neutral-950 text-white ring-1 ring-neutral-950"
                    : "bg-white text-neutral-950 ring-1 ring-neutral-200"
                }`}
              >
                {tier.highlighted && (
                  <span className="mb-4 inline-block rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white">
                    Most popular
                  </span>
                )}
                <h3 className="text-lg font-semibold tracking-tight">
                  {tier.name}
                </h3>
                <p className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black tracking-tight">
                    {tier.price}
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      tier.highlighted ? "text-neutral-400" : "text-neutral-500"
                    }`}
                  >
                    {tier.period}
                  </span>
                </p>
                <p
                  className={`mt-3 text-sm leading-relaxed ${
                    tier.highlighted ? "text-neutral-300" : "text-neutral-600"
                  }`}
                >
                  {tier.description}
                </p>

                <ul className="mt-6 space-y-3">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <span
                        className={
                          tier.highlighted ? "text-emerald-400" : "text-emerald-600"
                        }
                      >
                        ✓
                      </span>
                      <span
                        className={
                          tier.highlighted ? "text-neutral-200" : "text-neutral-700"
                        }
                      >
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/sign-up"
                  className={`mt-8 block rounded-full px-5 py-3 text-center text-sm font-semibold transition ${
                    tier.highlighted
                      ? "bg-white text-neutral-950 hover:bg-neutral-200"
                      : "bg-neutral-950 text-white hover:bg-neutral-800"
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-neutral-500">
            14-day free trial on every plan. No credit card required.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24">
        <div className="mx-auto max-w-3xl px-6 lg:px-10">
          <h2 className="text-center text-3xl font-black tracking-tight sm:text-4xl">
            Questions, answered
          </h2>
          <div className="mt-12">
            {FAQS.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="border-t border-neutral-100 bg-neutral-950 py-24 text-white">
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-10">
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
            Your next lead is already waiting.
          </h2>
          <p className="mt-4 text-[17px] leading-relaxed text-neutral-400">
            Set up takes minutes. The first hot lead you rescue pays for the
            month.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/sign-up"
              className="rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200"
            >
              Try Lost Leads free
            </Link>
            <Link
              href="#pricing"
              className="rounded-full border border-neutral-700 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-neutral-900"
            >
              See pricing
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-neutral-100 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 sm:flex-row lg:px-10">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-950 text-white">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 1L9.8 6.2L15 8L9.8 9.8L8 15L6.2 9.8L1 8L6.2 6.2L8 1Z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span className="text-sm font-semibold tracking-tight">
              Lost Leads
            </span>
            <span className="ml-2 text-sm text-neutral-400">
              — never lose a follow-up again.
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-neutral-500">
            <Link href="#features" className="hover:text-neutral-950">
              Product
            </Link>
            <Link href="#pricing" className="hover:text-neutral-950">
              Pricing
            </Link>
            <Link href="#faq" className="hover:text-neutral-950">
              FAQ
            </Link>
            <Link href="/privacy" className="hover:text-neutral-950">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-neutral-950">
              Terms
            </Link>
          </div>

          <p className="text-sm text-neutral-400">
            © {new Date().getFullYear()} Lost Leads
          </p>
        </div>
      </footer>
    </div>
  );
}