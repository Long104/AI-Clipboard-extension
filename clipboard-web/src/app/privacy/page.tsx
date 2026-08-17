import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How the AI Clipboard extension handles your text and data.",
};

// ---- MUST-EDIT constants (flagged for the user) ----
const CONTACT_EMAIL = "privacy@example.com"; // TODO(owner): replace with real email before CWS submission
const LAST_UPDATED = "August 17, 2026";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen px-6 py-16 sm:px-10 font-[family-name:var(--font-geist-sans)] dark:bg-black dark:text-white">
      <article className="mx-auto max-w-2xl flex flex-col gap-10">
        <header className="flex flex-col gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-base leading-7 text-neutral-700 dark:text-neutral-300">
            AI Clipboard is a Chrome extension that transforms text you copy using AI. This page explains, in plain language, what data is involved and how it is handled. Summary: your copied text is sent to our server only when you use a feature, it is processed by AI and not stored on our servers, and your history stays on your device.
          </p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Last updated: {LAST_UPDATED}
          </p>
        </header>

        <section id="what-we-collect" className="flex flex-col gap-3">
          <h2 className="text-xl sm:text-2xl font-semibold mt-2">What We Collect</h2>
          <ul className="list-disc pl-6 flex flex-col gap-2 text-base leading-7 text-neutral-700 dark:text-neutral-300">
            <li>Text you explicitly copy while a feature is active (the selection you copied), and messages you type into the extension&apos;s chat panel. Nothing is captured until you copy or send a message.</li>
            <li>We do NOT collect: names, emails, addresses, browsing history, credentials, or any account information. There are no accounts and no sign-up.</li>
            <li>We do not use analytics, advertising, or tracking of any kind — in the extension or on this website.</li>
          </ul>
        </section>

        <section id="how-your-text-is-used" className="flex flex-col gap-3">
          <h2 className="text-xl sm:text-2xl font-semibold mt-2">How Your Text Is Used</h2>
          <p className="text-base leading-7 text-neutral-700 dark:text-neutral-300">
            When you copy text with a feature enabled, or when you send a message in the chat panel, that text is sent to our backend (<code className="rounded bg-black/[.05] px-1 py-0.5 dark:bg-white/[.06] font-[family-name:var(--font-geist-mono)] text-sm">https://clipboard-backend.aieasyuse.workers.dev</code>) to be processed by an AI model, and the result is returned to you in the extension.
          </p>
           <p className="text-base leading-7 text-neutral-700 dark:text-neutral-300">
            Your text is used only to generate your requested result. It is not used to train models by us, not sold, not shared for marketing.
          </p>
        </section>

        <section id="storage-and-retention" className="flex flex-col gap-3">
          <h2 className="text-xl sm:text-2xl font-semibold mt-2">Storage & Retention</h2>
          <ul className="list-disc pl-6 flex flex-col gap-2 text-base leading-7 text-neutral-700 dark:text-neutral-300">
            <li>Chat history, settings, and usage counts are stored in <code className="rounded bg-black/[.05] px-1 py-0.5 dark:bg-white/[.06] font-[family-name:var(--font-geist-mono)] text-sm">chrome.storage.local</code> — on your device only. They never leave your device and are never synced.</li>
            <li>Our backend does not store your text: it is processed in memory and discarded when your request completes. We do not keep copies in any database, cache, or log.</li>
          </ul>
        </section>

        <section id="ai-processing-and-third-parties" className="flex flex-col gap-3">
          <h2 className="text-xl sm:text-2xl font-semibold mt-2">AI Processing & Third Parties</h2>
          <p className="text-base leading-7 text-neutral-700 dark:text-neutral-300 break-words">
            AI features are powered by Cloudflare Workers AI (Llama 3.3 70B). To process your request, your selected text is transmitted to Cloudflare. Cloudflare acts as our processor/service provider; its handling of request data (including technical metadata such as IP address) is governed by Cloudflare&apos;s privacy policy: <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer" className="underline hover:text-black dark:hover:text-white">https://www.cloudflare.com/privacypolicy/</a>
          </p>
          <p className="text-base leading-7 text-neutral-700 dark:text-neutral-300">
            Apart from Cloudflare (hosting + AI), we do not send your data to any third party.
          </p>
        </section>

        <section id="browser-permissions" className="flex flex-col gap-3">
          <h2 className="text-xl sm:text-2xl font-semibold mt-2">Browser Permissions</h2>
          <ul className="list-disc pl-6 flex flex-col gap-2 text-base leading-7 text-neutral-700 dark:text-neutral-300">
            <li><code className="rounded bg-black/[.05] px-1 py-0.5 dark:bg-white/[.06] font-[family-name:var(--font-geist-mono)] text-sm">clipboardRead</code> / <code className="rounded bg-black/[.05] px-1 py-0.5 dark:bg-white/[.06] font-[family-name:var(--font-geist-mono)] text-sm">clipboardWrite</code> — required to capture the text you copy and to place the AI result back on your clipboard. Reading happens only in direct response to your copy action.</li>
            <li><code className="rounded bg-black/[.05] px-1 py-0.5 dark:bg-white/[.06] font-[family-name:var(--font-geist-mono)] text-sm">storage</code> — saves your settings and history locally on your device.</li>
            <li><code className="rounded bg-black/[.05] px-1 py-0.5 dark:bg-white/[.06] font-[family-name:var(--font-geist-mono)] text-sm">sidePanel</code>, <code className="rounded bg-black/[.05] px-1 py-0.5 dark:bg-white/[.06] font-[family-name:var(--font-geist-mono)] text-sm">tabs</code>, <code className="rounded bg-black/[.05] px-1 py-0.5 dark:bg-white/[.06] font-[family-name:var(--font-geist-mono)] text-sm">scripting</code>, <code className="rounded bg-black/[.05] px-1 py-0.5 dark:bg-white/[.06] font-[family-name:var(--font-geist-mono)] text-sm">alarms</code> — used to show the history panel and manage the extension&apos;s own interface and usage limits; they are not used to monitor your browsing.</li>
            <li>Network access is limited to our own backend domain.</li>
          </ul>
        </section>
        
        <section id="your-controls" className="flex flex-col gap-3">
          <h2 className="text-xl sm:text-2xl font-semibold mt-2">Your Controls</h2>
          <ul className="list-disc pl-6 flex flex-col gap-2 text-base leading-7 text-neutral-700 dark:text-neutral-300">
            <li>View or clear your history anytime from the extension&apos;s history panel (reset action).</li>
            <li>Turning the extension off stops all text capture and transmission — both copy processing and chat — immediately.</li>
            <li>Removing the extension from Chrome deletes all locally stored history and settings.</li>
          </ul>
        </section>

        <section id="contact" className="flex flex-col gap-3">
          <h2 className="text-xl sm:text-2xl font-semibold mt-2">Contact</h2>
          <p className="text-base leading-7 text-neutral-700 dark:text-neutral-300 break-words">
            Questions about this policy: <a href={`mailto:${CONTACT_EMAIL}`} className="underline hover:text-black dark:hover:text-white">{CONTACT_EMAIL}</a>. We aim to respond within a reasonable time.
          </p>
        </section>

        <section id="last-updated" className="flex flex-col gap-3">
            <h2 className="text-xl sm:text-2xl font-semibold mt-2">Last Updated</h2>
            <p className="text-base leading-7 text-neutral-700 dark:text-neutral-300">This policy was last updated on {LAST_UPDATED}. If we make material changes, we will update this page and the date above.</p>
        </section>

        <footer className="pt-8 border-t border-neutral-200 dark:border-neutral-800">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/" className="text-neutral-600 dark:text-neutral-400 hover:underline">
            ← Back to home
          </a>
        </footer>
      </article>
    </main>
  );
}
