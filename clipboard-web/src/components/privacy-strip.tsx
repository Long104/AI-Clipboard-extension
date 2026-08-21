export function PrivacyStrip() {
  return (
    <section id="privacy" className="border-y border-hairline bg-subtle/60">
      <div className="mx-auto max-w-[880px] px-6 py-20 sm:py-24">
        <p className="text-[12px] font-semibold tracking-[0.08em] uppercase text-ink-mute">Privacy</p>
        <div className="mt-6">
          {/* three statements, each: */}
          <p className="py-8 border-b border-hairline text-[1.0625rem] sm:text-[1.125rem] leading-[1.6] text-ink-body max-w-[64ch]">
            <strong className="font-semibold text-ink">Zero background surveillance:</strong>{" "}
            AI Clipboard activates only when you select text or trigger an explicit action—it never logs unselected browsing.
          </p>
          <p className="py-8 border-b border-hairline text-[1.0625rem] sm:text-[1.125rem] leading-[1.6] text-ink-body max-w-[64ch]">
            <strong className="font-semibold text-ink">Local key isolation:</strong>{" "}
            If you bring your own OpenAI or Anthropic API key, it stays strictly in local browser storage{" "}
            <code className="font-mono text-[0.9em]">(chrome.storage.local)</code>.
          </p>
          <p className="py-8 last:border-0 last:pb-0 text-[1.0625rem] sm:text-[1.125rem] leading-[1.6] text-ink-body max-w-[64ch]">
            <strong className="font-semibold text-ink">No training on your data:</strong>{" "}
            Free-tier queries route ephemerally through Cloudflare Workers AI and are discarded immediately after inference.
          </p>
        </div>
      </div>
    </section>
  );
}
