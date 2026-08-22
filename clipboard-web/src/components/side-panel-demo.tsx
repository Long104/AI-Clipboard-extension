"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import { ARTICLE_EXCERPT } from "@/components/demo/demo-content";

interface HistoryItem {
  id: string;
  query: string;
  answer: string;
  time: string;
  action?: string;
}

const STREAMING_ANSWERS: Record<string, string> = {
  "Why no recurrence?":
    "Transformers eliminate step-by-step recurrence, allowing parallel attention computation across all token positions without sequential state propagation bottlenecks.",
  "Compare to RNNs":
    "RNNs require sequential O(N) steps with fading memory; Transformers process full context in parallel O(1) sequential operations via multi-head self-attention.",
  "Cost at scale?":
    "Full attention scales quadratically O(N²) with sequence length, mitigated in practice by sparse attention patterns, low-rank KV caching, and 8-bit quantization.",
};

const INITIAL_HISTORY: HistoryItem[] = [
  { id: "h1", query: "Explain multi-head attention", answer: "Instead of a single relationship, the model splits tokens into independent subspaces (heads), computing attention in parallel to capture distinct linguistic patterns.", time: "12m ago", action: "explain" },
  { id: "h2", query: "Summarize §2", answer: "Section 2 presents self-attention mechanisms replacing recurrent layers, unlocking full sequence parallelization and constant maximum path length across representations.", time: "1h ago", action: "summarize" },
  { id: "h3", query: "Translate abstract", answer: "Transformer 架构完全弃用循环机制，仅依靠注意力机制建立输入与输出间的全局依赖，在显著减少训练时间的同时大幅提升翻译质量。", time: "3h ago", action: "translate" },
];

const SUGGESTED_QUESTIONS = ["Why no recurrence?", "Compare to RNNs", "Cost at scale?"];

export function SidePanelDemo() {
  const [filter, setFilter] = React.useState("");
  const [history, setHistory] = React.useState<HistoryItem[]>(INITIAL_HISTORY);
  const [activeId, setActiveId] = React.useState("h1");
  const [streaming, setStreaming] = React.useState<{ query: string; text: string; done: boolean } | null>(null);
  const [copied, setCopied] = React.useState(false);

  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const copyTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = React.useCallback(() => {
    if (timerRef.current !== null) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  React.useEffect(() => () => {
    clearTimer();
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
  }, [clearTimer]);

  const appendItem = React.useCallback((query: string, answer: string) => {
    const newItem: HistoryItem = { id: `h-${Date.now()}`, query, answer, time: "just now", action: "ask" };
    setHistory((prev) => [newItem, ...prev]);
    setActiveId(newItem.id);
  }, []);

  const handleAsk = React.useCallback((question: string) => {
    clearTimer();
    const targetAnswer = STREAMING_ANSWERS[question] || "Contextual summary generated directly from the selected paper excerpt.";
    const prefersReduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setStreaming({ query: question, text: targetAnswer, done: true });
      appendItem(question, targetAnswer);
      return;
    }
    setStreaming({ query: question, text: "", done: false });
    let index = 0;
    timerRef.current = setInterval(() => {
      index += 2;
      if (index >= targetAnswer.length) {
        clearTimer();
        setStreaming({ query: question, text: targetAnswer, done: true });
        appendItem(question, targetAnswer);
      } else {
        setStreaming({ query: question, text: targetAnswer.slice(0, index), done: false });
      }
    }, 20);
  }, [clearTimer, appendItem]);

  const handleCopy = React.useCallback(() => {
    const textToCopy = streaming ? streaming.text : history.find((h) => h.id === activeId)?.answer || "";
    if (!textToCopy) return;
    try {
      void navigator.clipboard?.writeText(textToCopy);
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard write failure ignored */ }
  }, [streaming, history, activeId]);

  const handleExportMarkdown = React.useCallback(() => {
    const md = "## AI Clipboard history\n\n" + history.map((item) => `- **${item.query}** (_${item.time}_): ${item.answer}`).join("\n\n") + "\n";
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "ai-clipboard-history.md";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [history]);

  const filteredHistory = React.useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return history;
    return history.filter((item) => item.query.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q));
  }, [history, filter]);

  return (
    <section id="sidepanel" className="py-section">
      <div className="mx-auto max-w-[1040px] px-6">
        <div>
          <span className="font-mono font-medium text-[12px] text-ink-mute">Side panel</span>
          <h2 className="font-display font-bold tracking-[-0.03em] text-[2rem] sm:text-[2.25rem] text-ink mt-2">Try the side panel</h2>
          <p className="text-[15px] sm:text-base text-ink-body mt-3 max-w-[52ch]">A persistent thread of everything you&apos;ve asked while reading.</p>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-[7fr,5fr] rounded-xl border border-hairline bg-white overflow-hidden">
          <div className="p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-hairline flex flex-col justify-between">
            <div>
              <p className="text-[12px] font-mono text-ink-mute mb-4">{ARTICLE_EXCERPT.byline}</p>
              <p className="text-[14px] leading-[1.75] text-ink-body">
                {ARTICLE_EXCERPT.paragraphs[0].split("prohibits parallelization").map((part, i, arr) => (
                  <React.Fragment key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <mark className="motif-selection">prohibits parallelization</mark>
                    )}
                  </React.Fragment>
                ))}
              </p>
            </div>
            <div className="mt-8 pt-6 border-t border-hairline">
              <span className="font-mono font-medium text-[11px] text-ink-mute block mb-3">Suggested queries</span>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button key={q} type="button" onClick={() => handleAsk(q)} className="min-h-[36px] px-3 rounded-full border border-hairline text-[12px] font-medium text-ink hover:bg-subtle transition-colors">{q}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col bg-white">
            <div className="px-4 h-12 border-b border-hairline flex items-center justify-between">
              <span className="text-[13px] font-semibold text-ink">History</span>
              <input
                type="text"
                placeholder="Filter…"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="h-8 w-32 sm:w-40 rounded-md border border-hairline px-2.5 text-[12px] text-ink placeholder:text-ink-ash focus:outline-none focus:border-hairline-strong"
              />
            </div>

            <div className="max-h-[340px] overflow-y-auto divide-y divide-hairline">
              {filteredHistory.length === 0 ? (
                <div className="p-4 text-[12px] text-ink-ash">No matching queries found.</div>
              ) : (
                filteredHistory.map((item) => {
                  const isSelected = activeId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => { setActiveId(item.id); setStreaming(null); }}
                      className={cn("w-full text-left px-4 py-3 hover:bg-subtle focus-visible:bg-subtle transition-colors block", isSelected && "border-l-2 border-l-primary pl-[14px]")}
                    >
                      <span className="text-[12px] font-medium text-ink truncate block">{item.query}</span>
                      <span className="text-[11px] text-ink-ash mt-0.5 flex items-center gap-2">
                        <span>{item.time}</span>
                        {item.action && (
                          <span className="font-mono font-normal text-[10px] bg-surface-subtle px-1.5 py-0.5 rounded text-ink-mute">{item.action}</span>
                        )}
                      </span>
                      <span className="text-[12px] leading-[1.6] text-ink-body mt-1.5 block">{item.answer}</span>
                    </button>
                  );
                })
              )}
            </div>

            <div className="border-t border-hairline p-4 min-h-[150px] flex flex-col justify-between">
              {streaming ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] font-medium text-ink truncate">{streaming.query}</span>
                    {!streaming.done ? (
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-[11px] text-ink-mute">AI is writing…</span>
                        <span aria-hidden className="block w-3.5 h-3.5 border-2 border-hairline-strong border-t-primary rounded-full animate-spin" />
                      </div>
                    ) : (
                      <span className="text-[11px] text-ink-mute">Done</span>
                    )}
                  </div>
                  <div className="text-[12px] leading-[1.6] text-ink-body">
                    {streaming.text}
                    {!streaming.done && (
                      <span aria-hidden className="inline-block w-[2px] h-[13px] bg-primary align-middle ml-0.5 animate-[caret-blink_1s_step-end_infinite]" />
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-[12px] text-ink-ash my-auto">Click a question on the left, or pick a suggestion.</div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-hairline mt-3">
                <button type="button" onClick={handleCopy} className="h-8 px-3 rounded-md border border-hairline text-[12px] font-medium text-ink hover:bg-subtle transition-colors">
                  {copied ? "Copied" : "Copy"}
                </button>
                <button type="button" onClick={handleExportMarkdown} className="h-8 px-3 rounded-md border border-hairline text-[12px] font-medium text-ink hover:bg-subtle transition-colors">
                  Export markdown
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
