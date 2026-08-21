"use client";

import { motion } from "framer-motion";
import { EyeOff, KeyRound, ShieldCheck } from "lucide-react";

const pillars = [
  {
    icon: EyeOff,
    title: "Zero Background Surveillance",
    body: "AI Clipboard activates only when you select text or trigger an explicit action—it never logs unselected browsing.",
  },
  {
    icon: KeyRound,
    title: "Local Key Isolation",
    body: (
      <>
        If you bring your own OpenAI or Anthropic API key, it stays strictly in
        local browser storage (<span className="font-mono">chrome.storage.local</span>).
      </>
    ),
  },
  {
    icon: ShieldCheck,
    title: "No Training on Your Data",
    body: "Free-tier queries route ephemerally through Cloudflare Workers AI and are discarded immediately after inference.",
  },
];

export function Privacy() {
  return (
    <section
      id="privacy"
      aria-label="Privacy and permissions"
      className="py-section max-w-[980px] mx-auto px-4 sm:px-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true, margin: "-64px" }}
        className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12"
      >
        {pillars.map((pillar) => (
          <div key={pillar.title}>
            <pillar.icon
              className="h-5 w-5 text-mute mb-4"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <h3 className="text-[21px] font-semibold tracking-[-0.01em] text-ink">
              {pillar.title}
            </h3>
            <p className="mt-2 text-[15px] leading-[1.5] text-body">
              {pillar.body}
            </p>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
