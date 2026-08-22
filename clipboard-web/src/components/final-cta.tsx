import { STORE_URL, GITHUB_URL, PRIVACY_URL } from "@/lib/constants";

export function FinalCta() {
  return (
    <>
      {/* Final CTA */}
      <section className="py-section">
        <div className="mx-auto max-w-[640px] px-6 text-center">
          <h2 className="font-display font-bold tracking-[-0.03em] leading-[1.15] text-[1.75rem] sm:text-[2.25rem] text-ink">
            Stop switching tabs to <span className="motif-selection">explain text</span>.
          </h2>
          <a
            href={STORE_URL}
            className="mt-8 inline-flex items-center justify-center min-h-[48px] px-8 rounded-md bg-primary hover:bg-primary-hover text-white text-[15px] font-medium transition-colors"
          >
            Add to Chrome — It&apos;s Free
          </a>
          <p className="mt-3 text-[13px] text-ink-ash">
            Free tier includes 10 requests every 2 hours. No credit card required.
          </p>
        </div>
      </section>
      {/* Footer */}
      <footer className="border-t border-hairline">
        <div className="mx-auto max-w-[980px] px-6 h-14 flex items-center justify-between text-[13px] text-ink-mute">
          <span>© {new Date().getFullYear()} AI Clipboard</span>
          <div className="flex items-center gap-4">
            <a href={PRIVACY_URL} className="hover:text-ink transition-colors">Privacy</a>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="hover:text-ink transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </>
  );
}
