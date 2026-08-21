export function FeatureRows() {
  return (
    <section id="features" className="py-section">
      <div className="mx-auto max-w-[1040px] px-6">
        <p className="text-center text-[12px] font-semibold tracking-[0.08em] uppercase text-ink-mute">
          Features
        </p>

        <div className="mt-8">
          {/* Row 1: Instant Zero-Setup Use */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center py-12 lg:py-16">
            {/* Visual column */}
            <div className="lg:col-span-7 lg:order-1">
              <div className="relative rounded-lg border border-hairline bg-white overflow-hidden">
                {/* Browser-chrome tab bar */}
                <div className="h-8 bg-subtle border-b border-hairline flex items-center gap-1.5 px-3">
                  <div className="w-2 h-2 rounded-full bg-hairline-strong" />
                  <div className="w-2 h-2 rounded-full bg-hairline-strong" />
                  <div className="w-2 h-2 rounded-full bg-hairline-strong" />
                </div>

                {/* Body with 4 fake text lines */}
                <div className="p-5 space-y-2.5">
                  <div className="h-2.5 rounded bg-subtle w-[90%]" />
                  <div className="h-2.5 rounded bg-subtle w-[75%]" />
                  <div className="h-2.5 rounded bg-subtle w-[85%]" />
                  <div className="h-2.5 rounded bg-subtle w-[60%]" />
                </div>

                {/* Floating popover card */}
                <div className="absolute bottom-4 right-4 w-48 rounded-md border border-hairline bg-white shadow-popover p-3">
                  <div className="text-[11px]">Summarized · 0.4s</div>
                  <div className="mt-2 space-y-1.5">
                    <div className="h-2 rounded bg-subtle w-[80%]" />
                    <div className="h-2 rounded bg-subtle w-[60%]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Copy column */}
            <div className="lg:col-span-5 lg:order-2">
              <h3 className="font-display font-bold tracking-[-0.02em] text-[1.375rem] sm:text-[1.5rem] text-ink">
                Instant Zero-Setup Use
              </h3>
              <p className="mt-3 text-[15px] sm:text-base leading-[1.6] text-ink-body">
                Install and run immediately. No account signup, no API key required to start, and sub-second responses.
              </p>
            </div>
          </div>

          {/* Row 2: Deep Dive Side Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center py-12 lg:py-16 border-t border-hairline">
            {/* Copy column */}
            <div className="lg:col-span-5 lg:order-1">
              <h3 className="font-display font-bold tracking-[-0.02em] text-[1.375rem] sm:text-[1.5rem] text-ink">
                Deep Dive Side Panel
              </h3>
              <p className="mt-3 text-[15px] sm:text-base leading-[1.6] text-ink-body">
                Hit Alt+C to slide out a persistent chat. Ask follow-up questions about selected text without leaving your active tab.
              </p>
            </div>

            {/* Visual column */}
            <div className="lg:col-span-7 lg:order-2">
              <div className="rounded-lg border border-hairline bg-white overflow-hidden grid grid-cols-1 sm:grid-cols-[55fr_45fr]">
                {/* Left 55% fake article lines */}
                <div className="p-5 space-y-2.5">
                  <div className="h-2.5 rounded bg-subtle w-[90%]" />
                  <div className="h-2.5 rounded bg-subtle w-[75%]" />
                  <div className="h-2.5 rounded bg-subtle w-[85%]" />
                  <div className="h-2.5 rounded bg-subtle w-[60%]" />
                  <div className="h-2.5 rounded bg-subtle w-[80%]" />
                </div>

                {/* Right 45% side panel */}
                <div className="border-t sm:border-t-0 sm:border-l border-hairline bg-white p-3">
                  <div className="flex items-center justify-between gap-2 pb-2 mb-1 border-b border-hairline">
                    <span className="text-[11px] font-semibold text-ink">
                      History
                    </span>
                    <div className="h-6 w-20 rounded-sm border border-hairline bg-white" />
                  </div>

                  <div>
                    <div className="border-b border-hairline last:border-0 py-1.5">
                      <p className="text-[10px] font-medium text-ink truncate">
                        Attention mechanisms in deep learning
                      </p>
                      <p className="text-[9px] text-ink-ash mt-0.5">
                        2m ago
                      </p>
                    </div>

                    <div className="border-b border-hairline last:border-0 py-1.5">
                      <p className="text-[10px] font-medium text-ink truncate">
                        Cloudflare Workers architecture
                      </p>
                      <p className="text-[9px] text-ink-ash mt-0.5">
                        14m ago
                      </p>
                    </div>

                    <div className="border-b border-hairline last:border-0 py-1.5">
                      <p className="text-[10px] font-medium text-ink truncate">
                        Local storage security model
                      </p>
                      <p className="text-[9px] text-ink-ash mt-0.5">
                        1h ago
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: Private by Architecture */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center py-12 lg:py-16 border-t border-hairline">
            {/* Visual column */}
            <div className="lg:col-span-7 lg:order-1">
              <div className="rounded-lg border border-hairline bg-white p-5 font-mono text-[12px] leading-[1.9] overflow-x-auto whitespace-pre">
                <div>
                  <span className="text-ink-mute">storage        </span>
                  <span className="text-ink">→ chrome.storage.local</span>
                </div>
                <div>
                  <span className="text-ink-mute">inference      </span>
                  <span className="text-ink">→ cloudflare workers · ephemeral</span>
                </div>
                <div>
                  <span className="text-ink-mute">training       </span>
                  <span className="text-ink">→ none, ever</span>
                </div>
              </div>
            </div>

            {/* Copy column */}
            <div className="lg:col-span-5 lg:order-2">
              <h3 className="font-display font-bold tracking-[-0.02em] text-[1.375rem] sm:text-[1.5rem] text-ink">
                Private by Architecture
              </h3>
              <p className="mt-3 text-[15px] sm:text-base leading-[1.6] text-ink-body">
                Custom API keys never leave local browser storage. Free tier requests run ephemerally on Cloudflare Workers AI.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
