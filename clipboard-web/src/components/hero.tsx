import { HeroFragments } from "@/components/hero-fragments";
import { ChevronDown } from "lucide-react";
import { STORE_URL, FIREFOX_URL, GITHUB_URL } from "@/lib/constants";

export function Hero() {
  return (
    <section className="hero-stage relative overflow-hidden min-h-[100dvh] flex flex-col items-center justify-center px-6 py-24 sm:py-28">

      <div className="mx-auto max-w-[880px] w-full">
        <h1 className="font-display font-extrabold tracking-[-0.04em] leading-[1.05] text-[clamp(2.5rem,7vw,3.75rem)] text-ink text-balance max-w-[720px] mx-auto text-center relative z-10">
          Understand anything <span className="motif-selection">faster than ever</span>.
        </h1>

        <p className="text-[1.125rem] sm:text-[1.25rem] leading-[1.6] text-ink-body max-w-xl mx-auto text-center mt-5 relative z-10">
          Copy text, get instant summaries, or ask follow-ups in a side panel.
          Zero tab-switching.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 relative z-10">
          <a
            href={STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center min-h-[44px] px-6 rounded-md bg-primary hover:bg-primary-hover text-white text-[15px] font-medium transition-colors shadow-[0_10px_30px_-12px_rgba(37,99,235,0.5)]"
          >
            Add to Chrome
          </a>
          <a
            href={FIREFOX_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center min-h-[44px] px-6 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-[15px] font-medium transition-colors shadow-[0_10px_30px_-12px_rgba(251,191,36,0.5)]"
          >
            Add to Firefox
          </a>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] px-4 inline-flex items-center gap-1 text-[15px] text-ink-mute hover:text-ink transition-colors"
          >
            View on GitHub<span aria-hidden>→</span>
          </a>
        </div>

        <p className="text-center text-[13px] text-ink-ash mt-3 relative z-10">
          Free tier includes 10 requests every 2 hours. No credit card required.
        </p>
      </div>

      <HeroFragments />

      {/* Minimal scroll cue — hints the live playground below the fold */}
      <div
        className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 hidden md:block text-ink-ash"
        aria-hidden
      >
        <ChevronDown className="h-5 w-5 animate-pulse" strokeWidth={1.5} />
      </div>
    </section>
  );
}
