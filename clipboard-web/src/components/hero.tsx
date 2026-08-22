"use client";

import * as React from "react";
import { useDemoRun } from "@/components/demo/use-demo-run";
import { ArticleCanvas } from "@/components/demo/article-canvas";
import { SelectionPopover } from "@/components/demo/selection-popover";
import { Keycap } from "@/components/keycap";
import { STORE_URL, GITHUB_URL } from "@/lib/constants";

export function Hero() {
  const demo = useDemoRun();
  const [anchorRect, setAnchorRect] = React.useState<DOMRect | null>(null);

  return (
    <section className="pt-28 sm:pt-32 pb-24 sm:pb-32">
      <div className="mx-auto max-w-[880px] px-6">
        <h1 className="font-display font-extrabold tracking-[-0.04em] leading-[1.05] text-[clamp(2.5rem,7vw,3.75rem)] text-ink text-balance max-w-[720px] mx-auto text-center">
          Understand anything <span className="motif-selection">faster than ever</span>.
        </h1>

        <p className="text-[1.125rem] sm:text-[1.25rem] leading-[1.6] text-ink-body max-w-xl mx-auto text-center mt-5">
          Copy text, get instant summaries, or ask follow-ups in a side panel.
          Zero tab-switching.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href={STORE_URL}
            className="inline-flex items-center justify-center min-h-[44px] px-6 rounded-md bg-primary hover:bg-primary-hover text-white text-[15px] font-medium transition-colors"
          >
            Add to Chrome
          </a>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] px-4 inline-flex items-center gap-1 text-[15px] text-ink-mute hover:text-ink transition-colors"
          >
            View on GitHub<span aria-hidden>→</span>
          </a>
        </div>

        <p className="text-center text-[13px] text-ink-ash mt-3">
          Free tier includes 10 requests every 2 hours. No credit card required.
        </p>

        <div className="mt-16 sm:mt-20 flex items-center justify-center gap-1.5 flex-wrap text-[14px] text-ink-mute">
          Select text or press
          <Keycap>⌘C</Keycap>
          anywhere. The explanation appears in place.
        </div>

        <div className="mt-6">
          <ArticleCanvas demo={demo} onAnchorRectChange={setAnchorRect} />
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
