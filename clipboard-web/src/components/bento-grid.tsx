import { BentoCard, FeatureRow } from "@/components/bento-card";
import { Keycap } from "@/components/keycap";
import { Check, Sparkles, Lock, FileText } from "lucide-react";

export function BentoGrid() {
  return (
    <section
      id="features"
      aria-label="Features"
      className="py-section max-w-[980px] mx-auto px-4 sm:px-6 space-y-24 md:space-y-32 lg:space-y-36"
    >
      {/* Row 1 (layout="left") */}
      <BentoCard
        title="Smart Clipboard History"
        description="Recalls recent clips automatically. Run one-click explain or summarize actions directly from the copy toast."
        visualElement={
          <div className="w-full max-w-sm mx-auto bg-surface-elevated rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-accent-green-soft text-accent-green flex items-center justify-center">
                <Check className="h-3 w-3" aria-hidden="true" />
              </span>
              <span className="font-mono text-caption-sm text-body">
                Captured
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="px-2.5 py-1 rounded-md bg-white text-xs font-medium flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-primary" aria-hidden="true" /> Explain
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white text-xs font-medium text-body flex items-center gap-1">
                <FileText className="h-3 w-3" aria-hidden="true" /> Summarize
              </span>
            </div>
          </div>
        }
        index={0}
        layout="left"
      />

      {/* Row 2 (layout="right") */}
      <BentoCard
        title="macOS Look Up Everywhere"
        description="Highlights trigger a lightweight floating card right next to your selection. Read the takeaway without losing your place."
        visualElement={
          <div className="w-full max-w-xs">
            <div className="flex items-center gap-1.5 text-xs font-medium text-ink mb-2">
              <Sparkles className="h-3.5 w-3.5 text-primary stroke-[1.5]" aria-hidden="true" />
              Explain
              <span className="ml-auto"><Keycap>⏎</Keycap></span>
            </div>
            <div className="space-y-1.5 text-xs text-body">
              <div className="flex items-start gap-1.5">
                <span className="text-primary mt-0.5" aria-hidden="true">•</span>
                <span>Self-attention computes word relevance globally</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-primary mt-0.5" aria-hidden="true">•</span>
                <span>Enables massive parallelization across tokens</span>
              </div>
            </div>
          </div>
        }
        index={1}
        layout="right"
      />

      {/* Row 3 (layout="left") */}
      <BentoCard
        title="Deep Dive Side Panel"
        description="Hit Alt+C to slide out a persistent chat. Ask follow-up questions about selected text without leaving your active tab."
        visualElement={
          <div className="w-full max-w-xs ml-auto space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-surface-elevated text-body">
              “What are the memory trade-offs?”
            </div>
            <div className="p-2.5 rounded-lg bg-surface-card text-ink flex items-center justify-between">
              <span>O(N²) context attention cost...</span>
              <span className="text-caption-sm font-mono text-accent-green">Streaming</span>
            </div>
            <div className="flex justify-end"><Keycap>⌥ C</Keycap></div>
          </div>
        }
        index={2}
        layout="left"
      />

      {/* Row 4 (layout="right") */}
      <BentoCard
        title="Private by Architecture"
        description="Custom API keys never leave local browser storage. Free tier requests run ephemerally on Cloudflare Workers AI."
        visualElement={
          <div className="flex items-center gap-2 justify-center">
            <Lock className="h-5 w-5 text-mute stroke-[1.5]" aria-hidden="true" />
            <span className="font-mono text-caption-sm text-ink">chrome.storage.local</span>
          </div>
        }
        index={3}
        layout="right"
      />

      {/* Row 5 (layout="center") */}
      <BentoCard
        title="Instant Zero-Setup Use"
        description="Install and run immediately. No account signup, no API key required to start, and sub-second responses."
        visualElement={
          <div className="flex gap-2 justify-center">
            <Keycap>⌘C</Keycap>
            <Keycap>⌥C</Keycap>
            <Keycap>⏎</Keycap>
            <Keycap>Esc</Keycap>
          </div>
        }
        index={4}
        layout="center"
      />
    </section>
  );
}
