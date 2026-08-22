"use client";

import * as React from "react";
import { useDemoRun } from "@/components/demo/use-demo-run";
import { ArticleCanvas } from "@/components/demo/article-canvas";
import { SelectionPopover } from "@/components/demo/selection-popover";
import { Keycap } from "@/components/keycap";

export function PlaygroundSection() {
  const demo = useDemoRun();
  const [anchorRect, setAnchorRect] = React.useState<DOMRect | null>(null);

  return (
    <section
      id="playground"
      className="relative pt-16 sm:pt-20 pb-[var(--section-y)] border-t border-hairline scroll-mt-20"
    >
      <div className="mx-auto max-w-[880px] px-6">
        <p className="text-center text-[12px] font-medium text-ink-ash">
          Interactive playground
        </p>
        <h2 className="mt-2 text-center font-display font-extrabold tracking-[-0.03em] leading-[1.1] text-[clamp(1.875rem,4vw,2.5rem)] text-ink text-balance">
          Try it yourself in real time.
        </h2>
        <p className="mt-4 text-center text-[1.05rem] leading-[1.6] text-ink-body max-w-lg mx-auto">
          Select any sentence in the paper below, or tap a quick action. Zero
          setup, nothing to install.
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5 text-[14px] text-ink-mute">
          Select text or press
          <Keycap>⌘C</Keycap>
          anywhere. The explanation appears in place.
        </div>

        {/* Reader window */}
        <div className="mt-10 rounded-xl border border-hairline bg-white shadow-[0_20px_40px_-20px_rgba(0,0,0,0.1)] overflow-hidden">
          <div className="flex items-center gap-2 px-4 h-11 border-b border-hairline bg-[#FAFAF8]">
            <span className="flex gap-1.5" aria-hidden>
              <span className="w-3 h-3 rounded-full bg-[#FF5F57]" />
              <span className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
              <span className="w-3 h-3 rounded-full bg-[#28C840]" />
            </span>
            <span className="ml-3 hidden sm:inline-flex items-center h-7 px-3 rounded-md border border-hairline bg-white font-mono text-[12px] text-ink-mute">
              arxiv.org/abs/1706.03762
            </span>
          </div>

          <div className="p-4 sm:p-6 bg-subtle">
            <ArticleCanvas demo={demo} onAnchorRectChange={setAnchorRect} />
          </div>
        </div>

        <SelectionPopover
          state={demo.state}
          streamedText={demo.streamedText}
          activeAction={demo.activeAction}
          anchorRect={anchorRect}
          onAction={demo.run}
          onDismiss={() => {
            demo.reset();
            setAnchorRect(null);
          }}
        />
      </div>
    </section>
  );
}
