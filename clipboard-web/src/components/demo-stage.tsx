export function DemoStage() {
  return (
    <div className="max-w-4xl mx-auto rounded-xl border border-hairline bg-canvas shadow-card overflow-hidden">
      {/* Top faux browser bar */}
      <div className="h-9 border-b border-hairline bg-surface-1 px-4 flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-[#2a2e39]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#2a2e39]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#2a2e39]" />
        <div className="ml-2 text-[11px] font-mono text-ink-tertiary">arXiv/abs/attention-is-all-you-need</div>
      </div>

      {/* Browser content */}
      <div className="p-5 sm:p-6">
        <h3 className="text-sm font-mono text-ink-secondary mb-3">Abstract</h3>
        <div className="space-y-2 text-sm text-ink-secondary mb-6">
          <p>
            <span className="font-mono text-lime">“</span>
            Transformer architectures leverage self-attention mechanisms to compute
            representations of their input and output without using sequence-aligned
            RNNs or convolution. <span className="font-mono text-lime">”</span>
          </p>
          <p>
            Recent work on sequence modeling has largely moved away from recurrent
            architectures. Transformer models have become the standard for
            language modeling, vision, and even reinforcement learning tasks.
          </p>
        </div>

        {/* Highlighted text with selection */}
        <div className="relative inline-block mb-4">
          <div className="text-sm text-ink-secondary pl-4 border-l-2 border-dashed border-hairline-strong/50">
            <span className="text-ink-primary font-medium">Selected:</span> Transformer architectures leverage self-attention mechanisms to compute representations of their input and output without using sequence-aligned RNNs or convolution.
          </div>
          <div className="absolute -top-2 -right-2">
            <div className="w-5 h-5 rounded-full bg-lime/20 border border-lime flex items-center justify-center">
              <span className="text-lime text-xs">✓</span>
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-1 mb-4 border-b border-hairline">
          <button className="px-4 py-2 text-xs font-mono text-ink-secondary border-b-2 border-lime bg-surface-2/50 transition-colors">
            Look Up Popover
          </button>
          <button className="px-4 py-2 text-xs font-mono text-ink-tertiary hover:text-ink-secondary transition-colors">
            Quick Copy Toast
          </button>
          <button className="px-4 py-2 text-xs font-mono text-ink-tertiary hover:text-ink-secondary transition-colors">
            Side Panel
          </button>
        </div>

        {/* Tab content */}
        <div className="space-y-4">
          {/* Look Up Popover Tab */}
          <div className="rounded-lg border border-hairline bg-surface-popover p-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-md bg-lime/20 flex items-center justify-center">
                <svg className="w-3 h-3 text-lime" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1l9 9-9 9-9-9 9-9z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-ink-primary">Explain</span>
            </div>
            <p className="text-xs leading-relaxed text-ink-secondary">
              Transformers use self-attention to process all words simultaneously, unlike RNNs which process sequentially. This enables better parallelization and captures long-range dependencies more effectively.
            </p>
          </div>

          {/* Quick Copy Toast Tab */}
          <div className="hidden rounded-lg border border-hairline bg-surface-popover p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-medium text-ink-primary">Copy Toast</div>
              <div className="text-xs text-ink-tertiary">Cmd+C</div>
            </div>
            <div className="flex gap-2 mb-3">
              <button className="h-7 px-2 rounded-md bg-lime/20 border border-lime/50 text-lime text-xs font-medium transition-colors">Explain</button>
              <button className="h-7 px-2 rounded-md bg-surface-2 border border-hairline text-ink-secondary text-xs font-medium transition-colors">Summarize</button>
            </div>
            <div className="text-xs text-ink-tertiary">✓ Captured to clipboard history</div>
          </div>

          {/* Side Panel Tab */}
          <div className="hidden rounded-lg border border-hairline bg-surface-popover p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-medium text-ink-primary">Side Panel</div>
              <div className="text-xs text-ink-tertiary">Alt+C</div>
            </div>
            <div className="space-y-2">
              <div className="text-xs text-ink-secondary">
                <span className="font-mono text-ink-tertiary">You:</span> Can you explain the transformer architecture in more detail?
              </div>
              <div className="text-xs text-ink-secondary">
                <span className="font-mono text-lime">AI:</span> Transformers use self-attention mechanisms to compute representations of input and output tokens simultaneously, enabling parallel processing across the entire sequence.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}