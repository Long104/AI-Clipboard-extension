"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Sparkles, X, Copy } from "lucide-react";
import { Keycap } from "@/components/keycap";

const SELECTION_TEXT =
  "Transformer architectures leverage self-attention mechanisms to compute representations of their input and output without using sequence-aligned RNNs or convolution.";

const TAKEAWAY_TEXT =
  "Instead of processing words sequentially like traditional RNNs, transformers weigh the relevance of all words in a sentence simultaneously using self-attention.";

const reveal = { duration: 0.3, ease: [0.16, 1, 0.3, 1] } as const;

export function HeroMockup() {
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const rotateX = useTransform(scrollYProgress, [0, 1], [4, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -8]);

  return (
    <div
      className="w-full max-w-[380px] mx-auto mt-16 sm:mt-20"
      role="img"
      aria-label="AI Clipboard popover explaining selected text"
      style={{ perspective: 1200 }}
    >
      {shouldReduceMotion ? (
        <div className="rounded-xl bg-white border border-hairline shadow-popover overflow-hidden text-left">
          <CardInner />
        </div>
      ) : (
        <motion.div
          style={{ rotateX, y }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...reveal, delay: 0.06 }}
          className="rounded-xl bg-white border border-hairline shadow-popover overflow-hidden text-left"
        >
          <CardInner />
        </motion.div>
      )}
    </div>
  );
}

function CardInner() {
  return (
    <>
      <div className="h-[38px] px-3.5 border-b border-hairline flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-mute stroke-[1.5]" aria-hidden="true" />
          <span className="text-[15px] font-semibold text-ink">Explain</span>
        </div>
        <button
          type="button"
          className="h-6 w-6 flex items-center justify-center rounded-sm text-mute hover:text-ink"
          aria-label="Close popover"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="p-3.5 text-[15px] leading-[1.5] text-body">
        {TAKEAWAY_TEXT}
        <div className="mt-2.5 flex flex-col gap-1.5 items-start">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-surface-elevated rounded-xs text-[12px] font-medium tracking-[0.04em] text-mute tabular-nums">
            10 requests / 2 hours
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-surface-elevated rounded-xs text-[12px] font-medium tracking-[0.04em] text-mute tabular-nums">
            280ms · Llama 3.3 70B
          </span>
        </div>
      </div>

      <div className="h-11 px-3 border-t border-hairline flex items-center justify-between">
        <button
          type="button"
          className="h-8 px-2.5 rounded-sm text-[15px] font-medium text-body hover:bg-surface-elevated hover:text-ink flex items-center gap-1.5"
        >
          <Copy className="h-4 w-4" aria-hidden="true" />
          Copy
        </button>
        <button
          type="button"
          className="h-8 px-2.5 rounded-sm text-[15px] font-medium text-body hover:bg-surface-elevated hover:text-ink flex items-center gap-1.5"
        >
          Open in chat <Keycap>⌥C</Keycap>
        </button>
      </div>
    </>
  );
}