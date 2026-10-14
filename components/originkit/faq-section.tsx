"use client";

import { Fragment, useId, useState } from "react";
import type {
  ComponentProps,
  CSSProperties,
  KeyboardEvent,
  ReactNode,
} from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition,
} from "motion/react";
import { cn } from "@/lib/utils";

const SEND: Transition = { type: "spring", visualDuration: 0.42, bounce: 0.28 };
const SHIFT: Transition = { type: "spring", visualDuration: 0.4, bounce: 0.1 };
const LEAVE: Transition = { duration: 0.16, ease: [0.4, 0, 1, 1] };
const INSTANT: Transition = { duration: 0 };

const QUESTION = '[data-slot="faq-question"]';
const KEY_STEPS: Record<string, (index: number, last: number) => number> = {
  ArrowDown: (index) => index + 1,
  ArrowUp: (index) => index - 1,
  Home: () => 0,
  End: (_, last) => last,
};

export type FaqItem = {
  id: string;
  question: string;
  answer: ReactNode;
};

/** Official Lost Leads signature 8-point geometric mark */
function LostLeadsMark() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="size-4">
      <path d="M8 1L9.8 6.2L15 8L9.8 9.8L8 15L6.2 9.8L1 8L6.2 6.2L8 1Z" />
    </svg>
  );
}

type BubbleProps = {
  item: FaqItem;
  ids: { question: string; answer: string };
  open: boolean;
  openId: string | null;
  reduced: boolean;
};

function Question({
  item,
  ids,
  open,
  openId,
  reduced,
  onToggle,
}: BubbleProps & { onToggle: () => void }) {
  return (
    <motion.button
      id={ids.question}
      type="button"
      data-slot="faq-question"
      aria-expanded={open}
      aria-controls={open ? ids.answer : undefined}
      onClick={onToggle}
      layout="position"
      layoutDependency={openId}
      transition={reduced ? INSTANT : SHIFT}
      whileTap={reduced ? undefined : { scale: 0.98 }}
      className={cn(
        "max-w-[85%] cursor-pointer self-start rounded-[18px] rounded-bl-[6px] px-4.5 py-3 text-left text-[15px] font-medium leading-[1.4] tracking-[-0.01em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]/30",
        open
          ? "bg-[#ede6de] text-[#111111] border border-[#d6cbbe] shadow-none dark:bg-[#262626] dark:text-white dark:border-neutral-700"
          : "bg-[#f8f6f4] text-[#111111] border border-[#eae4e2] shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:bg-[#ede7e1] hover:border-[#ded5cb] dark:bg-[#1a1a1a] dark:text-white dark:border-neutral-800",
      )}
    >
      {item.question}
    </motion.button>
  );
}

function Answer({
  item,
  ids,
  open,
  openId,
  reduced,
  avatar,
}: BubbleProps & { avatar: ReactNode }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      {open && (
        <motion.div
          key="answer"
          data-slot="faq-answer"
          layout="position"
          layoutDependency={openId}
          initial={{ opacity: 0, scale: 0.6, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{
            opacity: 0,
            scale: 0.9,
            transition: reduced ? INSTANT : LEAVE,
          }}
          transition={reduced ? INSTANT : SEND}
          style={{ originX: 1, originY: 1 }}
          className="flex items-end justify-end gap-2.5"
        >
          <div
            id={ids.answer}
            role="region"
            aria-labelledby={ids.question}
            className="max-w-[85%] rounded-[18px] rounded-br-[6px] bg-[var(--faq-accent)] px-4.5 py-3 text-[15px] leading-[1.5] tracking-[-0.01em] text-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-black/10"
          >
            {item.answer}
          </div>
          {avatar != null && (
            <span
              aria-hidden
              className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#111111] text-white shadow-sm border border-neutral-800"
            >
              {avatar}
            </span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export type FaqProps = Omit<ComponentProps<"div">, "defaultValue"> & {
  items: FaqItem[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  accent?: string;
  avatar?: ReactNode;
};

export function Faq({
  items,
  value,
  defaultValue = null,
  onValueChange,
  accent = "#111111",
  avatar = <LostLeadsMark />,
  className,
  style,
  ...props
}: FaqProps) {
  const reduced = useReducedMotion() ?? false;
  const uid = useId();
  const [own, setOwn] = useState(defaultValue);
  const openId = value === undefined ? own : value;

  const toggle = (id: string) => {
    const next = openId === id ? null : id;
    if (value === undefined) setOwn(next);
    onValueChange?.(next);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = KEY_STEPS[event.key];
    const target = event.target as HTMLElement;
    if (!step || !target.matches(QUESTION)) return;

    const questions = [
      ...event.currentTarget.querySelectorAll<HTMLElement>(QUESTION),
    ];
    const next = step(questions.indexOf(target), questions.length - 1);
    event.preventDefault();
    questions[(next + questions.length) % questions.length]?.focus();
  };

  return (
    <div
      data-slot="faq"
      onKeyDown={onKeyDown}
      style={{ "--faq-accent": accent, ...style } as CSSProperties}
      className={cn("relative flex w-full max-w-xl flex-col gap-3", className)}
      {...props}
    >
      {items.map((item) => {
        const bubble = {
          item,
          ids: {
            question: `${uid}-${item.id}-question`,
            answer: `${uid}-${item.id}-answer`,
          },
          open: openId === item.id,
          openId,
          reduced,
        };

        return (
          <Fragment key={item.id}>
            <Question {...bubble} onToggle={() => toggle(item.id)} />
            <Answer {...bubble} avatar={avatar} />
          </Fragment>
        );
      })}
    </div>
  );
}

export const FIVE_FAQS: FaqItem[] = [
  {
    id: "rescue-queue",
    question: "How does the 24-hour Rescue Queue actually work?",
    answer:
      "When a new inquiry arrives via your website form, WhatsApp, or webhook, Lost Leads automatically schedules a 24-hour follow-up task. If nobody contacts the lead within 24 hours, the deal elevates into the Rescue Queue on your dashboard with an orange flame alert.",
  },
  {
    id: "website-forms",
    question: "How do I connect my existing website contact forms?",
    answer:
      "Inside your Settings page, you get a unique Inbound Webhook URL. Paste this URL into your form action (WordPress, Webflow, Squarespace, Wix), trigger it via fetch(), or pipe submissions in from Zapier or Typeform. Leads land in your feed instantly.",
  },
  {
    id: "whatsapp",
    question: "Can I connect incoming WhatsApp inquiries?",
    answer:
      "Yes! Lost Leads includes a dedicated WhatsApp webhook endpoint compatible with Meta WhatsApp Cloud API and Twilio. Whenever a prospective patient or client messages you, a lead is created and the 24-hour safety net clock begins.",
  },
  {
    id: "mark-contacted",
    question: "What happens when I contact a lead in the Rescue Queue?",
    answer:
      "Click 'Mark Contacted' or outreach via phone/WhatsApp directly. The lead immediately clears from the Rescue Queue, the touchpoint is recorded on their activity timeline, and the overdue alert is resolved.",
  },
  {
    id: "free-trial",
    question: "Do I need a credit card for the 14-day free trial?",
    answer:
      "No credit card is required. You can sign up, connect your forms, capture real leads, and see how many deals the Rescue Queue saves before paying a single dollar. If it rescues just 1 deal, it pays for the entire year.",
  },
];

export function FaqSection() {
  return (
    <section className="relative bg-white py-20 px-4 sm:px-6 lg:px-8 border-t border-[#eae4e2]">
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

        {/* Chat-style Animated FAQ */}
        <div className="flex justify-center">
          <Faq
            items={FIVE_FAQS}
            defaultValue="rescue-queue"
            accent="#111111"
            className="w-full max-w-2xl"
          />
        </div>

        {/* Still have questions card */}
        <div className="mt-14 rounded-2xl border border-[#eae4e2] bg-white p-6 text-center flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="text-center sm:text-left">
            <h3 className="font-switzer font-semibold text-[#111] text-base">Still have questions?</h3>
            <p className="text-sm text-[#666] mt-0.5">We are happy to answer any technical or setup questions.</p>
          </div>
          <a
            href="/sign-up"
            className="inline-flex items-center justify-center rounded-full bg-[#111] px-5 py-2.5 text-xs font-semibold text-white hover:bg-neutral-800 transition shadow-sm"
          >
            Start 14-Day Free Trial
          </a>
        </div>
      </div>
    </section>
  );
}

export default Faq;
