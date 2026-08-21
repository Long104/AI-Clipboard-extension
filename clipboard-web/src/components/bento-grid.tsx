import { BentoCard } from "@/components/bento-card";
import { Keycap } from "@/components/keycap";
import { Check, Sparkles, Lock, Zap, FileText } from "lucide-react";

export function BentoGrid() {
  return (
    <section
      id="features"
      aria-label="Features"
      className="py-section max-w-[1240px] mx-auto px-4 sm:px-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Smart Clipboard History — surface */}
        <BentoCard
          title="Smart Clipboard History"
          description="Recalls recent clips automatically. Run one-click explain or summarize actions directly from the copy toast."
          index={0}
          visualElement={
            <div className="w-full max-w-sm mx-auto bg-surface-elevated border border-hairline rounded-md p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-accent-green-soft text-accent-green flex items-center justify-center">
                  <Check className="h-3 w-3" aria-hidden="true" />
                </span>
                <span className="font-mono text-caption-sm text-body">
                  Captured
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="px-2.5 py-1 rounded-md bg-surface-card border border-hairline text-xs font-medium text-accent-blue flex items-center gap-1">
                  <Zap className="h-3 w-3" aria-hidden="true" /> Explain
                </span>
                <span className="px-2.5 py-1 rounded-md bg-surface-card border border-hairline text-xs font-medium text-body flex items-center gap-1">
                  <FileText className="h-3 w-3" aria-hidden="true" /> Summarize
                </span>
              </div>
            </div>
          }
        />

        {/* 2. macOS Look Up Everywhere — elevated */}
        <BentoCard
          elevated
          title="macOS Look Up Everywhere"
          description="Highlights trigger a lightweight floating card right next to your selection. Read the takeaway without losing your place."
          index={1}
          visualElement={
            <div className="w-full max-w-xs rounded-md border border-hairline bg-canvas p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-ink mb-2">
                <Sparkles className="h-3.5 w-3.5 text-accent-blue" aria-hidden="true" />
                Explain
                <span className="ml-auto"><Keycap>⏎</Keycap></span>
              </div>
              <div className="space-y-1.5 text-xs text-body">
                <div className="flex items-start gap-1.5">
                  <span className="text-accent-blue mt-0.5" aria-hidden="true">•</span>
                  <span>Self-attention computes word relevance globally</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-accent-blue mt-0.5" aria-hidden="true">•</span>
                  <span>Enables massive parallelization across tokens</span>
                </div>
              </div>
            </div>
          }
        />

        {/* 3. Deep Dive Side Panel — surface */}
        <BentoCard
          title="Deep Dive Side Panel"
          description="Hit Alt+C to slide out a persistent chat. Ask follow-up questions about selected text without leaving your active tab."
          index={2}
          visualElement={
            <div className="w-full max-w-xs rounded-md border border-hairline bg-canvas p-3 space-y-2 text-xs ml-auto">
              <div className="p-2 rounded-sm bg-surface-elevated text-body border-l-2 border-accent-blue">
                &ldquo;What are the memory trade-offs?&rdquo;
              </div>
              <div className="p-2 rounded-sm bg-surface border border-hairline text-ink flex items-center justify-between">
                <span>O(N²) context attention cost...</span>
                <span className="text-caption-sm font-mono text-accent-green">Streaming</span>
              </div>
              <div className="flex justify-end"><Keycap>⌥ C</Keycap></div>
            </div>
          }
        />

        {/* 4. Private by Architecture — elevated */}
        <BentoCard
          elevated
          title="Private by Architecture"
          description="Custom API keys never leave local browser storage. Free tier requests run ephemerally on Cloudflare Workers AI."
          index={3}
          visualElement={
            <div className="flex flex-col items-center justify-center p-3 rounded-md border border-hairline bg-canvas text-center space-y-2">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-mute" aria-hidden="true" />
                <span className="font-mono text-caption-sm text-ink">
                  chrome.storage.local
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-canvas text-accent-green text-caption-sm font-mono border border-hairline">
                Zero Cloud Storage
              </span>
            </div>
          }
        />

        {/* 5. Instant Zero-Setup Use — full width, surface */}
        <BentoCard
          spanClass="md:col-span-2"
          title="Instant Zero-Setup Use"
          description="Install and run immediately. No account signup, no API key required to start, and sub-second responses."
          index={4}
          visualElement={
            <div className="w-full max-w-md mx-auto rounded-md border border-hairline bg-canvas p-3 flex items-center justify-between">
              <div className="font-mono text-caption-sm text-ink tabular-nums flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-accent-green" aria-hidden="true" />
                280ms inference latency
              </div>
              <span className="px-2 py-1 rounded-xs bg-surface-elevated border border-hairline font-mono text-caption-sm text-mute">
                0 Inputs
              </span>
            </div>
          }
        />
      </div>
    </section>
  );
}
