"use client";

import * as React from "react";
import { ARTICLE_EXCERPT, PROMPT_SENTENCE, PRESET_CHIPS } from "./demo-content";
import type { UseDemoRun, DemoAction } from "./use-demo-run";

export interface ArticleCanvasProps {
  demo: UseDemoRun;
  onAnchorRectChange: (rect: DOMRect | null) => void;
}

export function ArticleCanvas({ demo, onAnchorRectChange }: ArticleCanvasProps) {
  const stageRef = React.useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = React.useState(false);

  const { state, setSelectedText, reset, run } = demo;

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Selection detection for desktop (mouseup) and mobile (touchend), plus
  // selectionchange so we catch drag-select and async mobile selection.
  React.useEffect(() => {
    if (!isClient) return;

    const handleSelection = () => {
      const sel = window.getSelection();
      if (!sel) return;

      const hasText = sel.toString().trim().length > 0;
      const hasRange = sel.rangeCount > 0;

      if (
        hasText &&
        hasRange &&
        stageRef.current?.contains(sel.anchorNode)
      ) {
        setSelectedText(sel.toString());
        onAnchorRectChange(sel.getRangeAt(0).getBoundingClientRect());
        return;
      }

      // Selection cleared while we're showing the quick-action popover → reset.
      if (sel.isCollapsed && state === "selected") {
        reset();
        onAnchorRectChange(null);
      }
    };

    const onMouseUp = () => handleSelection();
    const onTouchEnd = () => handleSelection();

    document.addEventListener("mouseup", onMouseUp, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    document.addEventListener("selectionchange", handleSelection);

    return () => {
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("selectionchange", handleSelection);
    };
  }, [isClient, state, setSelectedText, reset, onAnchorRectChange]);

  // Single-tap demo: select the target span, anchor the popover, run the action.
  const handlePresetClick = (chip: (typeof PRESET_CHIPS)[number]) => {
    const root = stageRef.current;
    if (!root) return;

    const targetId =
      chip.id === "summarize"
        ? "paragraph"
        : chip.id === "translate"
          ? "sentence"
          : "term";
    const target = root.querySelector<HTMLElement>(
      `[data-demo-target="${targetId}"]`,
    );
    if (!target) return;

    target.scrollIntoView({ block: "nearest", behavior: "smooth" });

    const range = document.createRange();
    range.selectNode(target);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);

    setSelectedText(target.textContent ?? "");
    onAnchorRectChange(range.getBoundingClientRect());
    run(chip.id as DemoAction);
  };

  const isIdle = isClient && state === "idle";

  // Paragraph 2 holds both demo targets: the term and the selectable sentence.
  const para2 = ARTICLE_EXCERPT.paragraphs[1];
  const [beforeTerm, afterTerm] = para2.split("multi-head attention");
  const [between, afterSentence] = afterTerm.split(PROMPT_SENTENCE);

  return (
    <div>
      {/* Preset chips row */}
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {PRESET_CHIPS.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => handlePresetClick(chip)}
            className="min-h-[44px] px-4 rounded-full border border-hairline bg-white text-[13px] font-medium text-ink hover:bg-subtle hover:border-hairline-strong transition-colors"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Editorial paper sheet */}
      <div
        ref={stageRef}
        role="region"
        aria-label="Interactive demo — select text to try AI actions"
        className="max-w-[880px] mx-auto bg-white border border-hairline rounded-xl p-6 sm:p-8 shadow-sm"
      >
        <div className="text-[12px] text-ink-ash font-sans tracking-[0.08em] uppercase mb-4">
          {ARTICLE_EXCERPT.byline}
        </div>

        {ARTICLE_EXCERPT.paragraphs.map((para, idx) => {
          if (idx === 1) {
            return (
              <p
                key={idx}
                data-demo-target="paragraph"
                className="text-[15px] sm:text-base leading-[1.75] text-ink-body font-sans select-text cursor-text"
              >
                {beforeTerm}
                <span data-demo-target="term" className="relative">
                  multi-head attention
                </span>
                {between}
                <span data-demo-target="sentence" className="relative">
                  {isIdle && (
                    <>
                      <span className="hidden sm:flex absolute -top-7 left-0 bg-primary text-white text-[11px] font-medium px-2 h-5 rounded-full items-center animate-pulse">
                        Select any text
                      </span>
                      <span
                        aria-hidden
                        className="hidden sm:block absolute -top-2 left-4 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-primary"
                      />
                    </>
                  )}
                  <span className="bg-[var(--primary-surface)] rounded-[4px] px-0.5">
                    {PROMPT_SENTENCE}
                  </span>
                </span>
                {afterSentence}
              </p>
            );
          }

          return (
            <p
              key={idx}
              className="text-[15px] sm:text-base leading-[1.75] text-ink-body font-sans select-text cursor-text"
            >
              {para}
            </p>
          );
        })}
      </div>
    </div>
  );
}
