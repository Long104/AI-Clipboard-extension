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
    <section
      id="privacy"
      aria-label="Privacy and permissions"
      className="py-section max-w-[1240px] mx-auto px-4 sm:px-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {pillars.map((pillar) => (
          <div
            key={pillar.title}
            className="bg-surface border border-hairline rounded-lg p-4 hover:border-hairline-strong transition-none"
          >
            <pillar.icon
              className="text-mute mb-3 h-5 w-5"
              aria-hidden="true"
            />
            <h3 className="text-sm font-medium leading-[1.6] tracking-[0.2px] text-ink mb-1.5">
              {pillar.title}
            </h3>
            <p className="text-sm leading-[1.6] text-mute">{pillar.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
