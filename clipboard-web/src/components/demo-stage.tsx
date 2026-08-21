"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, FileText, Copy, Check } from "lucide-react";
import { Keycap } from "@/components/keycap";

const SAMPLE_LEAD =
  "Recent work on sequence modeling has largely moved away from recurrent architectures. ";
const SAMPLE_TARGET =
  "Transformer architectures leverage self-attention mechanisms to compute representations of their input and output without using sequence-aligned RNNs or convolution.";
const SAMPLE_TAIL =
  " This shift enables parallel training across all positions and removes the sequential bottleneck that limited earlier architectures on long-range dependencies.";

const RESULTS = {
  Explain:
    "Transformers weigh the relevance of every word in a sentence simultaneously using self-attention — unlike RNNs, which process tokens one at a time. This removes the sequential bottleneck and lets representation learning parallelize across all positions.",
  Summarize:
    "Transformers replace recurrence with self-attention: every token attends to every other token at once, so representations are computed in parallel rather than sequentially.",
} as const;

type Phase = "idle" | "selected" | "loading" | "result";
type Mode = keyof typeof RESULTS;

const reveal = { duration: 0.3, ease: [0.16, 1, 0.3, 1] } as const;

export function DemoStage() {
  const frameRef = React.useRef<HTMLDivElement>(null);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [mode, setMode] = React.useState<Mode>("Explain");
  const [pill, setPill] = React.useState({ top: 0, left: 0 });

  const clearTimer = React.useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  React.useEffect(() => clearTimer, [clearTimer]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        clearTimer();
        setPhase("idle");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [clearTimer]);

  const handleSelection = () => {
    const frame = frameRef.current;
    if (!frame) return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.toString().trim()) {
      setPhase((p) => (p === "loading" || p === "result" ? p : "idle"));
      return;
    }
    if (sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (!frame.contains(range.commonAncestorContainer)) return;
    const rect = range.getBoundingClientRect();
    const host = frame.getBoundingClientRect();
    const left = Math.min(
      Math.max(rect.left - host.left + rect.width / 2, 100),
      Math.max(host.width - 100, 100),
    );
    const top = Math.max(rect.top - host.top - 40, 0);
    setPill({ top, left });
    setPhase("selected");
  };

  const run = (m: Mode) => {
    setMode(m);
    setPhase("loading");
    clearTimer();
    timerRef.current = setTimeout(() => setPhase("result"), 700);
  };

  return (
    <div
      ref={frameRef}
      onMouseUp={handleSelection}
      onTouchEnd={handleSelection}
      className="relative bg-white border border-hairline rounded-lg p-8 sm:p-10 select-text"
    >


      {/* Selectable reading text */}
      <div className="space-y-3 text-[17px] leading-[1.6] text-body">
        <p>
          {SAMPLE_LEAD}
          <mark className="bg-accent-blue-soft text-ink rounded-[3px] px-1 py-0.5 box-decoration-clone">
            {SAMPLE_TARGET}
          </mark>
          {SAMPLE_TAIL}
        </p>
        <p className="mt-3 text-[15px] text-mute">
          Try it: drag across the highlighted sentence above, or any sentence on
          this page.
        </p>

        {/* Touch fallback (mobile only) — guarantees the flow on iOS where selection never fires */}
        <p className="mt-4 text-[12px] text-mute">Tap to preview</p>
        <div className="mt-4 flex items-center gap-2 sm:hidden">
          <button
            type="button"
            onClick={() => run("Explain")}
            className="h-11 px-4 rounded-full bg-surface-elevated text-[15px] font-medium text-ink active:scale-[0.98] flex items-center gap-1.5"
          >
            <Sparkles className="h-4 w-4 stroke-[1.5]" aria-hidden="true" />
            Explain
          </button>
          <button
            type="button"
            onClick={() => run("Summarize")}
            className="h-11 px-4 rounded-full bg-surface-elevated text-[15px] font-medium text-ink active:scale-[0.98] flex items-center gap-1.5"
          >
            <FileText className="h-4 w-4 stroke-[1.5]" aria-hidden="true" />
            Summarize
          </button>
        </div>
      </div>

      {/* Floating action pill anchored to the selection */}
      <AnimatePresence>
        {phase === "selected" && (
          <motion.div
            key="pill"
            initial={{ opacity: 0, scale: 0.96, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.1, ease: "easeIn" } }}
            transition={reveal}
            style={{ top: pill.top, left: pill.left }}
            className="absolute z-10 -translate-x-1/2 rounded-full bg-white border border-hairline px-1.5 py-1 flex items-center gap-1 text-xs font-medium shadow-none"
          >
            <button
              type="button"
              onClick={() => run("Explain")}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-primary hover:bg-surface-elevated transition-none"
            >
              <Sparkles className="h-3.5 w-3.5 stroke-[1.5]" aria-hidden="true" />
              Explain
            </button>
            <span className="h-3 w-px bg-hairline" aria-hidden="true" />
            <button
              type="button"
              onClick={() => run("Summarize")}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-body hover:bg-surface-elevated hover:text-ink transition-none"
            >
              <FileText className="h-3.5 w-3.5 stroke-[1.5]" aria-hidden="true" />
              Summarize
            </button>
            <span className="h-3 w-px bg-hairline" aria-hidden="true" />
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-mute">
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              Copy
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result area: empty / loading / result */}
      <div className="mt-6" aria-live="polite">
        {phase === "idle" && (
          <div className="p-4 text-center text-[15px] text-mute">
            Select text above to trigger inline Look Up
          </div>
        )}

        {phase === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-[560px] rounded-lg bg-surface-elevated p-4 animate-pulse"
          >
            <div className="flex items-center gap-2 text-[15px] font-semibold text-ink">
              <Sparkles className="h-4 w-4 text-primary stroke-[1.5]" aria-hidden="true" />
              {mode}
            </div>
            <div className="mt-3 space-y-2">
              <div className="h-3 rounded-xs bg-white/60 w-full" />
              <div className="h-3 rounded-xs bg-white/60 w-11/12" />
              <div className="h-3 rounded-xs bg-white/60 w-3/4" />
            </div>
          </motion.div>
        )}

        {phase === "result" && (
          <motion.div
            key="result"
            role="status"
            initial={{ opacity: 0, scale: 0.96, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-[560px] rounded-md bg-white border border-hairline overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 pt-3">
              <div className="flex items-center gap-2 text-sm font-medium text-ink">
                <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
                {mode}
              </div>
              <button
                type="button"
                onClick={() => setPhase("idle")}
                className="text-xs font-medium text-mute hover:text-ink transition-none"
              >
                Reset
              </button>
            </div>
            <div className="p-4 text-[15px] leading-[1.6] text-body">
              {RESULTS[mode]}
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-surface-elevated rounded-xs text-[12px] font-medium tracking-[0.04em] text-mute tabular-nums">
                  280ms · Llama 3.3 70B
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-surface-elevated rounded-xs text-[12px] font-medium tracking-[0.04em] text-mute tabular-nums">
                  10 requests / 2 hours
                </span>
              </div>
            </div>
            <div className="h-11 px-3 border-t border-hairline flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(RESULTS[mode]);
                  // show copy feedback if needed
                }}
                className="h-8 px-2.5 rounded-sm text-[15px] font-medium text-body hover:bg-surface-elevated hover:text-ink transition-none flex items-center gap-1.5"
              >
                <Check className="h-4 w-4" aria-hidden="true" />
                Copy
              </button>
              <button
                type="button"
                className="h-8 px-2.5 rounded-sm text-[15px] font-medium text-body hover:bg-surface-elevated hover:text-ink transition-none flex items-center gap-1.5"
              >
                Open in chat <Keycap>⌥C</Keycap>
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}