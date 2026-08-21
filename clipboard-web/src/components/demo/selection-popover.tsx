"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";
import { POPOVER_ACTIONS, QUOTA_MESSAGE, CHROME_CTA } from "./demo-content";
import { STORE_URL } from "@/lib/constants";
import { MarkdownLite } from "./markdown-lite";
import type { DemoState, DemoAction } from "./use-demo-run";

interface SelectionPopoverProps {
  state: DemoState;
  streamedText: string;
  activeAction: DemoAction | null;
  anchorRect: DOMRect | null;
  onAction: (action: DemoAction) => void;
  onDismiss: () => void;
}

export function SelectionPopover({
  state,
  streamedText,
  activeAction,
  anchorRect,
  onAction,
  onDismiss,
}: SelectionPopoverProps) {
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const [popoverSize, setPopoverSize] = React.useState({ width: 0, height: 0 });
  const ref = React.useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Measure popover size after mount / on content change.
  React.useLayoutEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPopoverSize({ width: rect.width, height: rect.height });
    }
  }, [state, streamedText]);

  // Position the popover relative to the selection anchor.
  React.useEffect(() => {
    if (!anchorRect || !isClient) return;

    const computePosition = () => {
      const viewportWidth = window.innerWidth;
      const popoverW = popoverSize.width || 400;
      const popoverH = popoverSize.height || 120;
      const needed = popoverH + 10;

      // Preferred: above the selection, centered.
      let top = anchorRect.top - needed;
      if (anchorRect.top < needed) {
        // Not enough room above → place below.
        top = anchorRect.bottom + 10;
      }

      let left = anchorRect.left + anchorRect.width / 2 - popoverW / 2;
      left = Math.max(12, Math.min(left, viewportWidth - popoverW - 12));

      setPosition({ top, left });
    };

    computePosition();

    // Reposition on scroll/resize (popover follows the selection).
    const handleReposition = () => computePosition();
    window.addEventListener("scroll", handleReposition, { passive: true, capture: true });
    window.addEventListener("resize", handleReposition);

    return () => {
      window.removeEventListener("scroll", handleReposition, { capture: true });
      window.removeEventListener("resize", handleReposition);
    };
  }, [anchorRect, popoverSize, isClient]);

  // Dismiss on outside pointerdown + Escape.
  React.useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onDismiss();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onDismiss();
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onDismiss]);

  if (state === "idle" || !anchorRect) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.12 } }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        style={{ position: "fixed", top: position.top, left: position.left }}
        className={cn(
          "w-[400px] max-w-[calc(100vw-24px)] max-h-[80vh] overflow-y-auto",
          "bg-white border border-hairline rounded-lg shadow-popover z-[60]",
        )}
        role={state === "selected" ? "toolbar" : "dialog"}
        aria-label={state === "selected" ? "Quick actions" : "AI result"}
      >
        {state === "selected" && (
          <SelectedPanel onAction={onAction} />
        )}
        {state === "streaming" && (
          <StreamingPanel streamedText={streamedText} activeAction={activeAction} />
        )}
        {state === "success" && (
          <SuccessPanel streamedText={streamedText} activeAction={activeAction} />
        )}
        {state === "quota" && <QuotaPanel />}
      </motion.div>
    </AnimatePresence>
  );
}

function SelectedPanel({ onAction }: { onAction: (action: DemoAction) => void }) {
  return (
    <div className="flex items-stretch p-1">
      {POPOVER_ACTIONS.map((action, index) => {
        const isPrimary = action.id === "summarize";
        return (
          <button
            key={action.id}
            type="button"
            onClick={() => onAction(action.id as DemoAction)}
            className={cn(
              "text-[13px] font-medium px-3 h-9 transition-colors",
              "py-[7px]", // 44px hit target via vertical padding expansion
              index > 0 && !isPrimary && "border-l border-hairline",
              isPrimary
                ? "bg-primary text-white rounded-md hover:bg-primary-hover"
                : "text-ink hover:bg-subtle rounded-md",
            )}
          >
            {action.label}
          </button>
        );
      })}
    </div>
  );
}

function StreamingPanel({
  streamedText,
  activeAction,
}: {
  streamedText: string;
  activeAction: DemoAction | null;
}) {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] font-medium text-ink">
          {actionLabel(activeAction)}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-muted">AI is writing…</span>
          <span
            aria-hidden
            className="block w-4 h-4 border-2 border-hairline-strong border-t-primary rounded-full animate-spin"
          />
        </div>
      </div>
      <div className="min-h-[120px]">
        <MarkdownLite text={streamedText} />
        <span
          aria-hidden
          className="inline-block w-[2px] h-[14px] bg-primary align-middle animate-[caret-blink_1s_step-end_infinite]"
        />
      </div>
    </div>
  );
}

function SuccessPanel({
  streamedText,
  activeAction,
}: {
  streamedText: string;
  activeAction: DemoAction | null;
}) {
  const [copied, setCopied] = React.useState(false);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const copy = React.useCallback(() => {
    try {
      void navigator.clipboard?.writeText(streamedText);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — ignore */
    }
  }, [streamedText]);

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="w-4 h-4 text-success"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle cx="12" cy="12" r="9" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 12.5l2.5 2.5 4.5-5" />
        </svg>
        <span className="text-[13px] font-medium text-ink">
          {actionLabel(activeAction)}
        </span>
        <span className="text-[12px] text-muted">Done</span>
      </div>
      <div className="min-h-[120px] mb-3">
        <MarkdownLite text={streamedText} />
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={copy}
          className="text-[12px] h-8 px-2.5 rounded-md border border-hairline hover:bg-subtle transition-colors"
        >
          {copied ? "Copied" : "Copy"}
        </button>
        <button
          type="button"
          onClick={copy}
          className="text-[12px] h-8 px-2.5 rounded-md border border-hairline hover:bg-subtle transition-colors"
        >
          Insert
        </button>
        <a
          href="#sidepanel"
          className="text-[12px] h-8 px-2.5 rounded-md border border-hairline hover:bg-subtle transition-colors inline-flex items-center no-underline text-ink"
        >
          Expand Sidepanel
        </a>
      </div>
    </div>
  );
}

function QuotaPanel() {
  return (
    <div className="p-4">
      <p className="text-[13px] text-body mb-3">{QUOTA_MESSAGE}</p>
      <Link
        href={STORE_URL}
        className="block w-full bg-primary hover:bg-primary-hover text-white h-10 px-5 rounded-md text-sm font-medium text-center no-underline"
      >
        {CHROME_CTA}
      </Link>
      <p className="mt-2 text-[11px] text-muted text-center">Free · Chrome</p>
    </div>
  );
}

function actionLabel(action: DemoAction | null): string {
  switch (action) {
    case "summarize":
      return "Summarize";
    case "explain":
      return "Explain";
    case "actions":
      return "Action Items";
    case "translate":
      return "Translate";
    case "copy":
      return "Copy";
    default:
      return "AI result";
  }
}
