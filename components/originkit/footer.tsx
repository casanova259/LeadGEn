import Link from "next/link";

const LogoMark = () => (
  <svg width="20" height="20" viewBox="0 0 16 16" fill="none" className="size-5">
    <path d="M8 1L9.8 6.2L15 8L9.8 9.8L8 15L6.2 9.8L1 8L6.2 6.2L8 1Z" fill="#ffffff" />
  </svg>
);

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#101010] text-[#888] border-t border-[#1e1e1e] pt-16 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#1e1e1e]">
          {/* Brand Column */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-white/10 text-white">
                <LogoMark />
              </span>
              <span className="font-geist text-lg font-semibold tracking-tight text-white">
                Lost Leads
              </span>
            </div>
            <p className="text-sm text-[#888] max-w-sm leading-relaxed">
              Stop losing leads you already paid for. Automated 24h follow-up tasks, live Rescue Queue alerts, and daily email digests for busy small businesses.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
              </span>
              <span className="text-xs font-mono text-[#888]">All systems operational</span>
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white font-mono">
              Product
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#features" className="hover:text-white transition">
                  Rescue Queue
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition">
                  Pricing &amp; Plans
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition">
                  Inbound Webhooks
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition">
                  WhatsApp Ingest
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white font-mono">
              Account
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/sign-in" className="hover:text-white transition">
                  Sign in
                </Link>
              </li>
              <li>
                <Link href="/sign-up" className="hover:text-white transition">
                  Start 14-day free trial
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition">
                  Go to Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#666]">
          <p>&copy; {currentYear} Lost Leads, Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Built for clinics, salons, real estate &amp; agencies</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
