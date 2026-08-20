import { Sparkles, X, Copy, FileText } from "lucide-react";

const SELECTION_TEXT =
  "Transformer architectures leverage self-attention mechanisms to compute representations of their input and output without using sequence-aligned RNNs or convolution.";

const TAKEWAY_TEXT =
  "Instead of processing words sequentially like traditional RNNs, transformers weigh the relevance of all words in a sentence simultaneously using self-attention.";

export function HeroMockup() {
  return (
    <div
      className="w-full max-w-[620px] mx-auto mt-12 sm:mt-16 p-3 sm:p-4 rounded-2xl bg-surface-1 border border-hairline-strong shadow-popover relative"
      role="img"
      aria-label="AI Clipboard extension popover showing an inline AI explanation of selected text"
    >
      {/* Faux Window Chrome */}
      <div className="flex items-center gap-3 px-1 pb-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2a2e39] transition-colors hover:bg-[#ef4444]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#2a2e39] transition-colors hover:bg-[#f59e0b]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#2a2e39] transition-colors hover:bg-[#22c55e]" />
        </div>
        <div className="mx-auto flex items-center gap-1.5 px-3 py-1 rounded-md bg-surface-2 border border-hairline text-[11px] font-mono text-ink-tertiary">
          <FileText className="h-3 w-3" />
          research_paper_rag.pdf
        </div>
        <span className="w-8" aria-hidden="true" />
      </div>

      {/* Simulated Browser Body */}
      <div className="rounded-lg border border-hairline bg-canvas p-4 sm:p-5 text-[13px] leading-relaxed text-ink-secondary relative">
        <p>
          Recent work on sequence modeling has largely moved away from
          recurrent architectures.{" "}
          <mark className="bg-lime/15 text-ink-primary rounded-[3px] px-1 py-0.5 box-decoration-clone">
            {SELECTION_TEXT}
          </mark>{" "}
          This shift enables parallel training across all positions and removes
          the sequential bottleneck that limited earlier architectures on
          long-range dependencies.
        </p>

        {/* Floating Action Pill */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-surface-3/95 backdrop-blur-md border border-hairline-strong px-3 py-1.5 shadow-lg flex items-center gap-2 text-xs font-medium text-ink-primary animate-in fade-in zoom-in-95 duration-200">
          <span className="flex items-center gap-1 text-lime">
            <Sparkles className="h-3.5 w-3.5" />
            Explain
          </span>
          <span className="h-3 w-px bg-hairline" aria-hidden="true" />
          <span className="flex items-center gap-1">Summarize</span>
          <span className="h-3 w-px bg-hairline" aria-hidden="true" />
          <span className="flex items-center gap-1">
            <Copy className="h-3 w-3" />
            Copy
          </span>
        </div>

        {/* Result Popover Card */}
        <div className="w-full max-w-[420px] rounded-xl bg-surface-popover border border-hairline-strong shadow-2xl p-4 mt-3 ml-auto sm:mr-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink-primary">
              <Sparkles className="h-4 w-4 text-lime" />
              Explain
            </div>
            <button
              type="button"
              className="h-6 w-6 flex items-center justify-center rounded-md text-ink-tertiary hover:text-ink-primary hover:bg-surface-2 transition-colors"
              aria-label="Close popover"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-[13px] leading-relaxed text-ink-secondary">
            {TAKEWAY_TEXT}
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-mono text-ink-tertiary bg-surface-2 border border-hairline rounded-full px-2.5 py-1 tabular-nums">
            <span aria-hidden="true">⚡</span> 280ms • Llama 3.3 70B (Cloudflare
            Workers AI)
          </div>
          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              className="h-8 px-3 rounded-md bg-surface-2 hover:bg-surface-3 border border-hairline hover:border-hairline-hover text-xs font-medium text-ink-primary transition-colors"
            >
              Copy
            </button>
            <button
              type="button"
              className="h-8 px-3 rounded-md bg-surface-2 hover:bg-surface-3 border border-hairline hover:border-hairline-hover text-xs font-medium text-ink-primary transition-colors"
            >
              Open in Side Panel <span className="font-mono">Alt+C</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}