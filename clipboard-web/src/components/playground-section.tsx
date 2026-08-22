"use client";

import * as React from "react";
import { useDemoRun } from "@/components/demo/use-demo-run";
import { ArticleCanvas } from "@/components/demo/article-canvas";
import { SelectionPopover } from "@/components/demo/selection-popover";

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

        {/* Reader sheet — no fake browser chrome, just the paper */}
        <div className="mt-10 rounded-xl border border-hairline bg-white shadow-[0_20px_40px_-20px_rgba(0,0,0,0.1)] overflow-hidden">
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
