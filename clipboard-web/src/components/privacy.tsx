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
    body: "If you bring your own OpenAI or Anthropic API key, it stays strictly in local browser storage (chrome.storage.local).",
  },
  {
    icon: ShieldCheck,
    title: "No Training on Your Data",
    body: "Free-tier queries route ephemerally through Cloudflare Workers AI and are discarded immediately after inference.",
  },
];

export function Privacy() {
  return (
    <section id="privacy" className="py-16 sm:py-20 border-y border-hairline bg-surface-1/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="flex flex-col items-start">
              <pillar.icon className="text-ink-secondary mb-3 h-6 w-6" aria-hidden="true" />
              <h3 className="text-base font-semibold text-ink-primary mb-2">
                {pillar.title}
              </h3>
              <p className="text-sm text-ink-secondary leading-relaxed">
                {pillar.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}