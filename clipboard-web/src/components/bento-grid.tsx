import { BentoCard } from "@/components/bento-card";
import { Check, Sparkles, Lock, Zap, FileText } from "lucide-react";

export function BentoGrid() {
  return (
    <section id="features" className="py-20 sm:py-28 max-w-6xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-12">
        <p className="text-xs font-mono text-ink-tertiary uppercase tracking-widest text-center">
          CAPABILITIES
        </p>
        <h2 className="text-3xl sm:text-4xl font-semibold text-ink-primary tracking-tight text-center mt-2">
          Engineered for deep focus.
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5 mt-12">
        {/* Block 1: Smart Clipboard History (Wide Lead Card) */}
        <BentoCard
          title="Smart Clipboard History"
          description="Recalls recent clips automatically. Run one-click explain or summarize actions directly from the copy toast."
          spanClass="md:col-span-3 lg:col-span-4"
          index={0}
          visualElement={
            <div className="w-full max-w-sm mx-auto bg-surface-popover border border-hairline-strong rounded-lg p-3 shadow-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-semantic-green/20 text-semantic-green flex items-center justify-center text-xs">
                  <Check className="h-3 w-3" />
                </span>
                <span className="text-xs font-mono text-ink-secondary">
                  Captured
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="px-2.5 py-1 rounded-md bg-surface-2 border border-hairline text-xs font-medium text-lime flex items-center gap-1">
                  <Zap className="h-3 w-3" /> Explain
                </span>
                <span className="px-2.5 py-1 rounded-md bg-surface-2 border border-hairline text-xs font-medium text-ink-secondary flex items-center gap-1">
                  <FileText className="h-3 w-3" /> Summarize
                </span>
              </div>
            </div>
          }
        />

        {/* Block 2: Inline Look Up Popover (Tall Card) */}
        <BentoCard
          title="macOS Look Up Everywhere"
          description="Highlights trigger a lightweight floating card right next to your selection. Read the takeaway without losing your place."
          spanClass="md:col-span-3 lg:col-span-2"
          index={1}
          visualElement={
            <div className="w-full rounded-lg border border-hairline bg-surface-popover p-3.5 shadow-md">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-primary mb-2">
                <Sparkles className="h-3.5 w-3.5 text-lime" />
                Explain
              </div>
              <div className="space-y-1.5 text-xs text-ink-secondary">
                <div className="flex items-start gap-1.5">
                  <span className="text-lime mt-0.5">•</span>
                  <span>Self-attention computes word relevance globally</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-lime mt-0.5">•</span>
                  <span>Enables massive parallelization across tokens</span>
                </div>
              </div>
            </div>
          }
        />

        {/* Block 3: Side Panel Chat */}
        <BentoCard
          title="Deep Dive Side Panel"
          description="Hit Alt+C to slide out a persistent chat. Ask follow-up questions about selected text without leaving your active tab."
          spanClass="md:col-span-3 lg:col-span-2"
          index={2}
          visualElement={
            <div className="w-full rounded-lg border border-hairline bg-surface-2 p-3 space-y-2 text-xs">
              <div className="p-2 rounded bg-surface-3 text-ink-secondary border-l-2 border-lime">
                &ldquo;What are the memory trade-offs?&rdquo;
              </div>
              <div className="p-2 rounded bg-surface-1 border border-hairline text-ink-primary flex items-center justify-between">
                <span>O(N²) context attention cost...</span>
                <span className="text-[10px] font-mono text-lime">Streaming</span>
              </div>
            </div>
          }
        />

        {/* Block 4: Private by Architecture */}
        <BentoCard
          title="Private by Architecture"
          description="Custom API keys never leave local browser storage. Free tier requests run ephemerally on Cloudflare Workers AI."
          spanClass="md:col-span-3 lg:col-span-2"
          index={3}
          visualElement={
            <div className="flex flex-col items-center justify-center p-3 rounded-lg border border-hairline bg-surface-popover text-center space-y-2">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-ink-secondary" />
                <span className="font-mono text-xs text-ink-primary">
                  chrome.storage.local
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-semantic-green/10 text-semantic-green text-[10px] font-mono border border-semantic-green/20">
                Zero Cloud Storage
              </span>
            </div>
          }
        />

        {/* Block 5: Instant Zero-Setup Use */}
        <BentoCard
          title="Instant Zero-Setup Use"
          description="Install and run immediately. No account signup, no API key required to start, and sub-second responses."
          spanClass="md:col-span-3 lg:col-span-2"
          index={4}
          visualElement={
            <div className="w-full rounded-lg border border-hairline bg-surface-popover p-3 flex items-center justify-between">
              <div>
                <div className="text-base font-bold text-ink-primary font-mono tabular-nums">
                  ⚡ &lt;320ms
                </div>
                <div className="text-[11px] text-ink-tertiary">TTFT Cloudflare Edge</div>
              </div>
              <span className="px-2 py-1 rounded bg-surface-2 border border-hairline text-[11px] font-mono text-ink-secondary">
                0 Inputs
              </span>
            </div>
          }
        />
      </div>
    </section>
  );
}