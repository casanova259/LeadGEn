import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-neutral-950">
      {/* NAVBAR */}
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
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
          <Link href="#product" className="hover:text-neutral-950">
            Product
          </Link>
          <Link href="#how-it-works" className="hover:text-neutral-950">
            How it works
          </Link>
          <Link href="#pricing" className="hover:text-neutral-950">
            Pricing
          </Link>
          <Link href="#faq" className="hover:text-neutral-950">
            FAQ
          </Link>
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
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-6 pt-6 lg:px-10">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-2 lg:items-center lg:gap-10">
          {/* Left column */}
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
                href="#demo"
                className="rounded-full bg-neutral-100 px-6 py-3.5 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-200"
              >
                Book a demo
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

          {/* Right column — product mockup */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-b from-orange-50 via-white to-neutral-50 p-6 shadow-[0_1px_0_0_rgba(0,0,0,0.04)] ring-1 ring-neutral-200 sm:p-8">
              {/* window chrome */}
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
                    status: "HOT",
                    wait: "26h no contact",
                    color: "bg-orange-500",
                  },
                  {
                    name: "Marcus Diallo",
                    source: "Instagram DM",
                    status: "NEW",
                    wait: "Just arrived",
                    color: "bg-blue-500",
                  },
                  {
                    name: "Elena Torres",
                    source: "Referral",
                    status: "WARM",
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

              {/* floating stat card */}
              <div className="absolute -right-3 -top-3 hidden w-[168px] rotate-2 rounded-2xl bg-neutral-950 p-4 text-white shadow-xl sm:block">
                <p className="text-xs text-neutral-400">Avg. response time</p>
                <p className="mt-1 text-2xl font-bold">
                  4.2<span className="text-sm font-medium">hrs</span>
                </p>
                <p className="mt-1 text-xs font-medium text-emerald-400">
                  ↓ 68% since Lost Leads
                </p>
              </div>

              {/* floating notification bubble */}
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

      {/* LOGO / TRUST STRIP */}
      <section className="mx-auto mt-24 max-w-7xl border-t border-neutral-100 px-6 py-10 lg:px-10">
        <p className="mb-6 text-center text-xs font-medium uppercase tracking-widest text-neutral-400">
          Trusted by teams who can&apos;t afford to lose a lead
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-neutral-400">
          {["Bloom Dental", "Northside Realty", "Studio Verve", "Clearline Legal", "Aster Med Spa"].map(
            (name) => (
              <span
                key={name}
                className="text-lg font-semibold tracking-tight text-neutral-300"
              >
                {name}
              </span>
            )
          )}
        </div>
      </section>
    </div>
  );
}