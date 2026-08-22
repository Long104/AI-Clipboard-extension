"use client";

import * as React from "react";
import { RESPONSES } from "./demo-content";

export type DemoState = "idle" | "selected" | "streaming" | "success" | "quota";
export type DemoAction = "summarize" | "explain" | "translate" | "actions" | "copy";

export interface UseDemoRun {
  state: DemoState;
  streamedText: string;
  activeAction: DemoAction | null;
  runsUsed: number;
  selectedText: string;
  setSelectedText: (text: string) => void;
  run: (action: DemoAction) => void;
  reset: () => void;
}

const STORAGE_KEY = "aiclip-demo-runs";
const MAX_RUNS = 3;
const TTFT_MS = 80;
const CHAR_MS = 20;

function readStoredRuns(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    const n = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(n) ? Math.min(Math.max(n, 0), MAX_RUNS) : 0;
  } catch {
    return 0;
  }
}

function writeStoredRuns(n: number): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, String(n));
  } catch {
    /* sessionStorage unavailable — ignore */
  }
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

export function useDemoRun(): UseDemoRun {
  const [state, setState] = React.useState<DemoState>("idle");
  const [streamedText, setStreamedText] = React.useState("");
  const [activeAction, setActiveAction] = React.useState<DemoAction | null>(null);
  const [runsUsed, setRunsUsed] = React.useState(0);
  const [selectedText, setSelectedTextState] = React.useState("");

  const ttftRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = React.useCallback(() => {
    if (ttftRef.current) {
      clearTimeout(ttftRef.current);
      ttftRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Hydrate runsUsed from sessionStorage on mount (guarded for SSR).
  React.useEffect(() => {
    setRunsUsed(readStoredRuns());
  }, []);

  // Clean up every timer on unmount.
  React.useEffect(() => clearTimers, [clearTimers]);

  const setSelectedText = React.useCallback((text: string) => {
    setSelectedTextState(text);
    setState((prev) => {
      if (prev === "streaming" || prev === "success" || prev === "quota") return prev;
      return "selected";
    });
  }, []);

  const completeRun = React.useCallback(() => {
    setRunsUsed((prev) => {
      const next = Math.min(prev + 1, MAX_RUNS);
      writeStoredRuns(next);
      return next;
    });
    setState("success");
  }, []);

  const run = React.useCallback(
    (action: DemoAction) => {
      // No-op while already streaming.
      if (state === "streaming") return;

      // 4th attempt (runsUsed >= 3) hits the quota wall.
      if (runsUsed >= MAX_RUNS) {
        setState("quota");
        return;
      }

      // Copy never counts as a run — jump straight to success with the raw selection.
      if (action === "copy") {
        setActiveAction("copy");
        setStreamedText(selectedText);
        setState("success");
        return;
      }

      const target = RESPONSES[action];
      setActiveAction(action);
      clearTimers();

      // Reduced motion: skip TTFT + per-char timers, go straight to full text + success.
      if (prefersReducedMotion()) {
        setStreamedText(target);
        completeRun();
        return;
      }

      setState("streaming");
      setStreamedText("");

      ttftRef.current = setTimeout(() => {
        let i = 0;
        intervalRef.current = setInterval(() => {
          i += 1;
          setStreamedText(target.slice(0, i));
          if (i >= target.length) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            completeRun();
          }
        }, CHAR_MS);
      }, TTFT_MS);
    },
    [state, runsUsed, selectedText, clearTimers, completeRun],
  );

  const reset = React.useCallback(() => {
    clearTimers();
    setStreamedText("");
    setActiveAction(null);
    setState("idle");
  }, [clearTimers]);

  return {
    state,
    streamedText,
    activeAction,
    runsUsed,
    selectedText,
    setSelectedText,
    run,
    reset,
  };
}
