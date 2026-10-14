// Delivered by Originkit · stack: nextjs · styling: tailwind
"use client";

import { motion, useReducedMotion } from "motion/react";

type SpotlightRevealProps = {
  text: string;
  id?: string;
  className?: string;
  blur?: number;
  delay?: number;
  active?: boolean;
  onComplete?: () => void;
};

const easeOutCubic = [0.215, 0.61, 0.355, 1] as const;

const SpotlightReveal = ({
  text,
  id,
  className,
  delay = 0,
  active = true,
  onComplete,
}: SpotlightRevealProps) => {
  const prefersReducedMotion = useReducedMotion();
  const words = text.split(" ");

  return (
    <h1 id={id} className={className}>
      {words.map((word, index) => {
        const wordDelay = prefersReducedMotion ? 0 : delay + index * 0.04;
        const hidden = prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 };
        const visible = { opacity: 1, y: 0 };

        return (
          <motion.span
            key={`${word}-${index}`}
            className="inline-block will-change-[transform,opacity]"
            initial={hidden}
            animate={active ? visible : hidden}
            transition={{
              type: "tween",
              duration: prefersReducedMotion ? 0.1 : 0.25,
              delay: active ? wordDelay : 0,
              ease: easeOutCubic,
            }}
          >
            {word}
            {index < words.length - 1 ? "\u00A0" : null}
          </motion.span>
        );
      })}
    </h1>
  );
};

export default SpotlightReveal;
