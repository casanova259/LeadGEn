"use client";

import { useState } from "react";
import { Plus, Minus, HelpCircle } from "lucide-react";

type FaqItem = {
  question: string;
  answer: string;
};

const FAQS: FaqItem[] = [
  {
    question: "How does the 24-hour Rescue Queue actually work?",
    answer:
      "When a new inquiry arrives via your website form, WhatsApp, or webhook, Lost Leads creates the lead and automatically schedules a 24-hour follow-up task. If nobody on your team contacts or updates the lead within that 24-hour window, the deal is automatically elevated into the Rescue Queue on your dashboard with an orange flame alert.",
  },
  {
    question: "How do I connect my existing website contact forms?",
    answer:
      "Inside your Settings page, you get a unique Inbound Webhook URL. You can paste this URL into your form action (WordPress, Webflow, Squarespace, Wix), trigger it via client-side fetch(), or pipe submissions in from tools like Zapier or Typeform. Any inquiry with a name, email, or phone is captured instantly.",
  },
  {
    question: "Can I connect incoming WhatsApp inquiries?",
    answer:
      "Yes! Lost Leads includes a dedicated WhatsApp webhook endpoint compatible with both the official Meta WhatsApp Cloud API and Twilio for WhatsApp. Whenever a prospective patient, client, or buyer sends you a WhatsApp message, a lead is created and the 24-hour safety net clock begins.",
  },
  {
    question: "What happens when I contact a lead in the Rescue Queue?",
    answer:
      "On the lead's detail page or leads table, click 'Mark Contacted' or call/WhatsApp them directly. The lead immediately clears from the Rescue Queue, the touchpoint is recorded on their activity timeline, and the overdue alert is resolved.",
  },
  {
    question: "Do I need a credit card for the 14-day free trial?",
    answer:
      "No credit card is required. You can sign up, connect your forms, capture real leads, and see how many deals the Rescue Queue saves before paying a single dollar. If it rescues just 1 deal, it pays for the entire year.",
  },
  {
    question: "Can multiple team members use Lost Leads together?",
    answer:
      "Yes. The growth and scale plans support multi-user teams and locations. Your front-desk staff, sales reps, or office managers can log in, review the task queue, and make updates in real-time.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleIndex = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="relative bg-[#faf8f6] py-20 px-4 sm:px-6 lg:px-8 border-t border-[#eae4e2]">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-14">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#111] shadow-[0px_1px_2px_rgba(0,0,0,0.06)] border border-[#eae4e2]">
            Got Questions?
          </span>
          <h2 className="mt-4 font-switzer text-[clamp(28px,4vw,44px)] font-semibold tracking-[-0.03em] text-[#111] leading-[1.15]">
            Frequently asked questions
          </h2>
          <p className="mt-3 text-[16px] text-[#555] max-w-xl font-normal leading-relaxed">
            Everything you need to know about the follow-up engine, webhook setup, and how Lost Leads protects your pipeline.
          </p>
        </div>

        {/* Accordion List */}
        <div className="divide-y divide-[#eae4e2] border-y border-[#eae4e2]">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={faq.question} className="py-5">
                <button
                  type="button"
                  onClick={() => toggleIndex(index)}
                  className="flex w-full items-center justify-between text-left gap-4 group cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="font-switzer text-lg font-semibold text-[#111] group-hover:text-black transition">
                    {faq.question}
                  </span>
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white border border-[#eae4e2] text-[#111] shadow-xs transition-transform duration-200">
                    {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                  </span>
                </button>

                {isOpen && (
                  <div className="mt-3 pr-10 text-[15px] leading-relaxed text-[#555]">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still have questions card */}
        <div className="mt-12 rounded-2xl border border-[#eae4e2] bg-white p-6 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h4 className="font-switzer font-semibold text-[#111] text-base">Still have questions?</h4>
            <p className="text-sm text-[#666] mt-0.5">We are happy to answer any technical or setup questions.</p>
          </div>
          <a
            href="/sign-up"
            className="inline-flex items-center justify-center rounded-full bg-[#111] px-5 py-2.5 text-xs font-semibold text-white hover:bg-neutral-800 transition"
          >
            Start 14-Day Free Trial
          </a>
        </div>
      </div>
    </section>
  );
}
