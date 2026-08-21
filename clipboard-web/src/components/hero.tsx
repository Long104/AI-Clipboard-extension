"use client";

import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { STORE_URL, GITHUB_URL } from "@/lib/constants";
import { HeroMockup } from "@/components/hero-mockup";

const spring = { stiffness: 550, damping: 36, mass: 0.8 } as const;

export function Hero() {
  return (
    <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-24 overflow-hidden">
      {/* Signature blue diagonal stripe band — exactly once per page */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-[6px]"
        style={{
          background:
            "repeating-linear-gradient(135deg, var(--hero-stripe-start) 0px, var(--hero-stripe-start) 12px, var(--hero-stripe-end) 12px, var(--hero-stripe-end) 24px)",
        }}
      />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-hairline mb-6"
        >
          <span
            className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse"
            aria-hidden="true"
          />
          <span className="font-mono text-caption-sm text-mute">
            Cloudflare Workers AI + Llama 3.3 70B
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.012 }}
          className="text-[36px] sm:text-[48px] lg:text-[64px] font-semibold leading-[1.1] tracking-normal text-ink max-w-3xl mx-auto"
        >
          Understand anything faster than ever.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.024 }}
          className="mt-6 text-lg leading-[1.6] text-mute max-w-[580px] mx-auto"
        >
          Copy text, get instant summaries, or ask follow-ups in a side panel.
          Zero tab-switching.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.036 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <a
            href={STORE_URL}
            className="h-11 px-6 w-full sm:w-auto bg-primary hover:bg-primary-hover active:bg-primary-pressed active:scale-95 text-primary-fg font-medium rounded-full text-sm flex items-center justify-center gap-2.5"
          >
            <Download className="h-4 w-4" />
            Add to Chrome
          </a>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="h-11 px-5 w-full sm:w-auto hover:bg-surface-elevated border border-hairline hover:border-hairline-strong active:scale-95 text-ink font-medium rounded-md text-sm flex items-center justify-center gap-2"
          >
            <svg
              role="img"
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-4 w-4"
              fill="currentColor"
            >
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
            View on GitHub
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...spring, delay: 0.048 }}
          className="mt-3 font-mono text-caption-sm text-ash"
        >
          Free tier includes 10 requests every 2 hours. No credit card required.
        </motion.p>
      </div>

      <HeroMockup />
    </section>
  );
}