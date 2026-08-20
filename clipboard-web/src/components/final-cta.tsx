import Link from "next/link";
import { Download } from "lucide-react";
import { STORE_URL, GITHUB_URL, PRIVACY_URL } from "@/lib/constants";

export function FinalCta() {
  return (
    <>
      <section
        id="cta"
        className="py-24 sm:py-32 relative overflow-hidden bg-gradient-to-b from-canvas to-surface-1 border-t border-hairline"
      >
        {/* Radial lime glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 500px 250px at 50% 0%, rgba(212,255,50,0.08), transparent 70%)",
          }}
        />

        <div className="mx-auto max-w-2xl px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-ink-primary text-center max-w-2xl mx-auto leading-[1.1]">
            Stop switching tabs to explain text.
          </h2>

          <a
            href={STORE_URL}
            className="mt-8 h-12 px-8 bg-lime hover:bg-lime-hover active:scale-[0.98] text-lime-fg font-semibold rounded-lg text-base mx-auto flex items-center justify-center gap-2 shadow-glow transition-all w-fit"
          >
            <Download className="h-4 w-4" />
            Add to Chrome — It&apos;s Free
          </a>

          <p className="mt-4 text-xs text-ink-tertiary text-center">
            Instant setup • 10 free requests / 2 hrs • Chromium MV3
          </p>
        </div>
      </section>

      <footer className="py-10 border-t border-hairline/80 max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-tertiary">
        <p>© 2026 AI Clipboard. Open source under MIT License.</p>
        <div className="flex items-center gap-6">
          <Link href={PRIVACY_URL} className="hover:text-ink-primary transition-colors">
            Privacy Policy
          </Link>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-ink-primary transition-colors"
          >
            GitHub Repo
          </a>
          <a href="#" className="hover:text-ink-primary transition-colors">
            Changelog
          </a>
        </div>
      </footer>
    </>
  );
}