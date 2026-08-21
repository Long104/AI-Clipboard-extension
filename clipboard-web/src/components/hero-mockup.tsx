"use client";

import { motion } from "framer-motion";
import { Sparkles, X, Copy, FileText, Check } from "lucide-react";
import { Keycap } from "@/components/keycap";

const SELECTION_TEXT =
  "Transformer architectures leverage self-attention mechanisms to compute representations of their input and output without using sequence-aligned RNNs or convolution.";

const TAKEAWAY_TEXT =
  "Instead of processing words sequentially like traditional RNNs, transformers weigh the relevance of all words in a sentence simultaneously using self-attention.";

const spring = { stiffness: 550, damping: 36, mass: 0.8 } as const;

export function HeroMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={spring}
      className="w-full max-w-[960px] mx-auto mt-12 sm:mt-16 p-3 sm:p-4 rounded-xl bg-surface border border-hairline shadow-popover relative"
      role="img"
      aria-label="AI Clipboard extension popover showing an inline AI explanation of selected text"
    >
      {/* Faux window chrome */}
      <div className="flex items-center gap-3 px-1 pb-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-stone" />
          <span className="w-2.5 h-2.5 rounded-full bg-stone" />
          <span className="w-2.5 h-2.5 rounded-full bg-stone" />
        </div>
        <div className="mx-auto flex items-center gap-1.5 px-3 py-1 rounded-md bg-surface-elevated border border-hairline font-mono text-caption-sm text-mute">
          <FileText className="h-3 w-3" aria-hidden="true" />
          research_paper_rag.pdf
        </div>
        <span className="w-8" aria-hidden="true" />
      </div>

      {/* Simulated page body */}
      <div className="rounded-lg border border-hairline-soft bg-canvas p-4 sm:p-5 text-sm leading-relaxed text-body relative">
        <p>
          Recent work on sequence modeling has largely moved away from
          recurrent architectures.{" "}
          <mark className="bg-accent-blue-soft text-ink rounded-[3px] px-1 py-0.5 box-decoration-clone">
            {SELECTION_TEXT}
          </mark>{" "}
          This shift enables parallel training across all positions and removes
          the sequential bottleneck that limited earlier architectures on
          long-range dependencies.
        </p>

        {/* Floating action pill */}
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.1 }}
          className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-surface border border-hairline-strong px-1.5 py-1 flex items-center gap-1 text-xs font-medium"
        >
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-accent-blue">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Explain
          </span>
          <span className="h-3 w-px bg-hairline" aria-hidden="true" />
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-body">
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            Summarize
          </span>
          <span className="h-3 w-px bg-hairline" aria-hidden="true" />
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-mute">
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            Copy
          </span>
        </motion.div>

        {/* Result popover card (command-palette-card spec) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ ...spring, delay: 0.18 }}
          className="w-full max-w-[380px] rounded-xl bg-surface border border-hairline shadow-popover overflow-hidden mt-4 ml-auto sm:mr-4"
        >
          <div className="h-[38px] px-3 border-b border-hairline flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-ink">
              <Sparkles className="h-4 w-4 text-accent-blue" aria-hidden="true" />
              Explain
            </div>
            <button
              type="button"
              className="h-6 w-6 flex items-center justify-center rounded-sm text-mute hover:text-ink transition-none"
              aria-label="Close popover"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>

          <div className="p-3.5 text-sm leading-[1.6] text-body">
            {TAKEAWAY_TEXT}
            <div className="mt-2.5 inline-flex items-center gap-1.5 px-2 py-0.5 bg-surface-elevated border border-hairline rounded-xs font-mono text-caption-sm text-mute tabular-nums">
              <span aria-hidden="true">⚡</span> 280ms • Llama 3.3 70B
              (Cloudflare Workers AI)
            </div>
            <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 bg-surface-elevated border border-hairline rounded-xs font-mono text-caption-sm text-mute tabular-nums">
              10/10 free queries • <Keycap className="mx-0.5">⌘ ,</Keycap> BYO
              key
            </div>
          </div>

          <div className="h-11 px-3 border-t border-hairline flex items-center justify-between">
            <button
              type="button"
              className="h-8 px-2.5 rounded-sm text-xs font-medium text-body hover:bg-surface-elevated hover:text-ink transition-none flex items-center gap-1.5"
            >
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              Copy
            </button>
            <button
              type="button"
              className="h-8 px-2.5 rounded-sm text-xs font-medium text-body hover:bg-surface-elevated hover:text-ink transition-none flex items-center gap-1.5"
            >
              Open in chat <Keycap>⌥ C</Keycap>
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}