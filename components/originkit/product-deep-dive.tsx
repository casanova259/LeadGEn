"use client";

import { useState } from "react";
import { Flame, Clock, Mail, ShieldAlert, ArrowRight, CheckCircle2, TrendingUp, Sparkles } from "lucide-react";

const STEPS = [
  {
    id: "capture",
    badge: "Step 1",
    title: "Instant Ingestion",
    description:
      "Website forms, webhooks, ads, and incoming messages land in your centralized feed the second they submit. No copy-pasting into spreadsheets.",
    icon: Sparkles,
  },
  {
    id: "engine",
    badge: "Step 2",
    title: "24-Hour Auto-Timer",
    description:
      "A follow-up task is scheduled automatically. If nobody contacts the lead within 24 hours, the lead is elevated to high-alert status.",
    icon: Clock,
  },
  {
    id: "rescue",
    badge: "Step 3",
    title: "Rescue Queue & Digest",
    description:
      "Uncontacted leads appear in the Rescue Queue on your dashboard with an orange flame, and in your daily 8am email digest until addressed.",
    icon: Flame,
  },
];

const SAMPLE_RESCUED_LEADS = [
  {
    name: "Dr. Alistair Vance",
    source: "Website Webhook",
    dealValue: "$2,400",
    waitTime: "26h no contact",
    status: "Rescued & Booked",
    highlight: true,
  },
  {
    name: "Elena Rostova",
    source: "Instagram DM",
    dealValue: "$1,850",
    waitTime: "19h no contact",
    status: "Followed Up",
    highlight: false,
  },
  {
    name: "Marcus Chen",
    source: "Google Ads",
    dealValue: "$950",
    waitTime: "28h no contact",
    status: "Rescued & Closed",
    highlight: true,
  },
];

export function ProductDeepDive() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="relative overflow-hidden bg-[#faf8f6] py-20 px-4 sm:px-6 lg:px-8 border-t border-[#eae4e2]">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#111] shadow-[0px_1px_2px_rgba(0,0,0,0.06)] border border-[#eae4e2]">
            Inside The Engine
          </span>
          <h2 className="mt-4 font-switzer text-[clamp(28px,4vw,46px)] font-semibold tracking-[-0.03em] text-[#111] leading-[1.15] max-w-3xl">
            Never let another high-intent inquiry slip through the cracks
          </h2>
          <p className="mt-4 text-[17px] text-[#555] max-w-2xl font-normal leading-relaxed">
            Most businesses lose 30–50% of new leads simply because life gets busy and follow-up gets delayed.
            Lost Leads turns follow-up from a memory test into an automated safety net.
          </p>
        </div>

        {/* Step Selector & Deep Dive Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-16">
          {/* Step Cards / Left Column */}
          <div className="lg:col-span-5 flex flex-col gap-3.5">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = activeStep === idx;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(idx)}
                  className={`text-left p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-white border-[#111] shadow-[0_8px_24px_rgba(0,0,0,0.06)] scale-[1.01]"
                      : "bg-[#f3efed]/60 border-transparent hover:bg-white/70 hover:border-[#eae4e2]"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`flex size-7 items-center justify-center rounded-lg text-xs font-semibold ${
                        isActive
                          ? "bg-[#111] text-white"
                          : "bg-[#eae4e2] text-[#666]"
                      }`}
                    >
                      <Icon size={14} />
                    </span>
                    <span className="text-xs font-semibold tracking-wider uppercase text-[#888]">
                      {step.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-[#111] font-switzer">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[#555] mt-1 leading-relaxed">
                    {step.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Interactive Visual Mockup / Right Column */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-[#e5dfdb] bg-white p-6 sm:p-8 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.08)]">
              {/* Chrome mockup header */}
              <div className="flex items-center justify-between pb-5 border-b border-[#f0ebe7] mb-6">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-[#ff5f56]" />
                  <span className="size-2.5 rounded-full bg-[#ffbd2e]" />
                  <span className="size-2.5 rounded-full bg-[#27c93f]" />
                  <span className="ml-3 font-mono text-xs text-[#888]">
                    lost-leads / rescue-engine-live
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-600 border border-orange-200/60">
                  <span className="size-1.5 rounded-full bg-orange-500 animate-pulse" />
                  Live Safety Net
                </span>
              </div>

              {/* Dynamic preview content */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-switzer font-semibold text-base text-[#111]">
                      Rescue Queue Priority Ticker
                    </h4>
                    <p className="text-xs text-[#777]">
                      Surfacing deals waiting &gt;24h without direct contact
                    </p>
                  </div>
                  <span className="text-xs font-medium text-[#111] bg-[#f4f0ec] px-2.5 py-1 rounded-md">
                    Avg rescue: +$1,733 / deal
                  </span>
                </div>

                <div className="divide-y divide-[#f4f0ec] border border-[#f0ebe7] rounded-xl overflow-hidden bg-[#faf8f6]">
                  {SAMPLE_RESCUED_LEADS.map((lead) => (
                    <div
                      key={lead.name}
                      className="flex items-center justify-between p-3.5 bg-white hover:bg-neutral-50/80 transition"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`size-2 rounded-full ${
                            lead.highlight ? "bg-orange-500 ring-4 ring-orange-100" : "bg-zinc-400"
                          }`}
                        />
                        <div>
                          <p className="text-sm font-semibold text-[#111] leading-tight">
                            {lead.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-[#777]">
                            <span>{lead.source}</span>
                            <span>•</span>
                            <span className="font-medium text-orange-600">
                              {lead.waitTime}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-bold text-[#111] font-mono">
                          {lead.dealValue}
                        </span>
                        <div className="flex items-center gap-1 justify-end text-[11px] font-medium text-emerald-600">
                          <CheckCircle2 size={11} />
                          {lead.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Micro Analytics Band */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="rounded-lg bg-[#f8f5f2] p-3 border border-[#ebe5e0]">
                    <span className="text-[11px] font-medium text-[#777] block">Rescue Rate</span>
                    <span className="text-lg font-bold text-[#111] font-switzer">88.4%</span>
                  </div>
                  <div className="rounded-lg bg-[#f8f5f2] p-3 border border-[#ebe5e0]">
                    <span className="text-[11px] font-medium text-[#777] block">Avg Response</span>
                    <span className="text-lg font-bold text-[#111] font-switzer">14 mins</span>
                  </div>
                  <div className="rounded-lg bg-[#f8f5f2] p-3 border border-[#ebe5e0]">
                    <span className="text-[11px] font-medium text-[#777] block">Revenue Saved</span>
                    <span className="text-lg font-bold text-emerald-700 font-switzer">+$5.2k/mo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Banner callout */}
        <div className="rounded-2xl bg-[#111] text-white p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-orange-400">
              The Math Is Simple
            </span>
            <h3 className="text-2xl sm:text-3xl font-semibold font-switzer mt-1 tracking-tight text-white">
              Rescue just 1 deal, and Lost Leads is paid for the whole year.
            </h3>
            <p className="text-zinc-400 text-sm mt-2">
              Clinics, salons, real estate brokers, and agencies report closing an average of 2–4 extra leads in their very first month.
            </p>
          </div>
          <a
            href="/sign-up"
            className="shrink-0 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#111] hover:bg-neutral-100 transition shadow-md"
          >
            Start 14-day free trial
            <ArrowRight size={15} />
          </a>
        </div>
      </div>
    </section>
  );
}
