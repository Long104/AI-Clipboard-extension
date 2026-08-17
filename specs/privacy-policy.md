# Privacy Policy Page (/privacy)

Branch: `feat/privacy-policy` · Worktree: `.worktrees/privacy-policy` · Date: 2026-08-17

---

## Section 1 — Product

### Goal & scope
Chrome Web Store submission requires a hosted Privacy Policy URL. Build a public
`/privacy` page on the **clipboard-web** Next.js app that honestly describes the
extension's data practices. This page is a **trust artifact**: plain, readable,
accurate, no dark patterns.

**In scope:**
- New route `clipboard-web/src/app/privacy/page.tsx` (static server component)
- Policy content grounded in the verified data-flow audit below
- Matches existing stack (Next.js 15 App Router + Tailwind v3 utility classes, Geist font from root layout)

**Out of scope (NOT building):**
- Redesign of the home page (it is still the stock create-next-app template; a footer link can be added when the real landing page is built)
- shadcn/ui introduction (not present in clipboard-web — do NOT add a dependency)
- Any backend/extension code changes
- Deployment (user merges + deploys later)

### Verified facts (code-audited — policy text MUST match these)
Source audit (file:line evidence in Discover report, summarized):

1. **Capture**: Extension listens to the `copy` event and reads `document.getSelection()` — ONLY on an explicit user copy action. No background/passive clipboard reading. (`clipboard-extension/src/contents/site-one.ts:7-8`)
2. **Transmission**: Background script sends `{ documentData: <text> }` via `POST https://clipboard-backend.aieasyuse.workers.dev/summarizeDocument`. No user ID, device ID, email, or account identifier is included. (`clipboard-extension/src/background.ts:54-61`)
3. **AI processing**: Worker forwards text to **Cloudflare Workers AI** (`@cf/meta/llama-3.3-70b-instruct-fp8-fast`) and returns the result. (`clipboard-backend/src/index.ts:87-110`)
4. **Backend persistence of user text: NONE.** No DB/KV/R2 write, no logging of request bodies on the `/summarizeDocument` path. (Verified against `clipboard-backend/src/index.ts` + `prisma/schema.prisma`)
5. **Local storage only**: chat history (`chatRoom`), settings (`isOn`), usage counter (`limit`) stored in `chrome.storage.local` — device-local, never synced. (`clipboard-extension/src/background.ts:106-114`)
6. **No analytics, no trackers, no ads, no error reporting, no third-party scripts** in extension, backend, or web. (deps + import scan, all three packages)
7. **No accounts, no sign-in, no cookies set by the site.**
8. **Manifest permissions** (source `clipboard-extension/package.json` manifest block): `clipboardWrite`, `clipboardRead`, `storage`, `tabs`, `scripting`, `alarms`; host permission limited to `https://clipboard-backend.aieasyuse.workers.dev/*`. (Built manifest additionally gains `sidePanel` via Plasmo; used to open the history panel.)
9. **Users can clear history** via the side panel's reset action; uninstalling removes all local data.

### Known caveats / open questions
- **Contact email is a placeholder** (`privacy@example.com`) — user MUST replace before submitting to CWS. Defined as a single constant at top of file for one-line swap. **FLAGGED in return message.**
- **Dormant Stripe code**: backend contains a `/checkout` endpoint that persists full name + address to D1, and clipboard-web has `/success/[id]` & `/cancel/[id]` pages. The extension and current site home page do NOT link to any purchase flow. Policy is scoped to the extension; if payments go live later, a Payments section disclosing name/address collection must be added. **FLAGGED.**
- **Cloudflare caveat**: requests transit Cloudflare (Worker + Workers AI); Cloudflare observes IPs/metadata per its own privacy policy. The Third Parties section links to https://www.cloudflare.com/privacypolicy/ and avoids absolute "we never see your IP" claims.
- **Last updated date**: rendered from a constant; set to 2026-08-17. Update on any future policy change.

### Acceptance criteria
1. `/privacy` route renders as a static server component (no `"use client"`, no data fetching).
2. Page contains these sections in order: What We Collect; How Your Text Is Used; Storage & Retention; AI Processing & Third Parties; Browser Permissions; Your Controls; Contact; Last Updated.
3. Every factual claim on the page maps to a verified fact above (Reviewer audits claim-by-claim).
4. Plain-language, readable typography; works in light + dark mode (site supports `dark:` variants); responsive on mobile.
5. No dark patterns: no consent walls, no legalese walls of unlabeled text, no tracker scripts.
6. Build + lint pass; page returns 200 with all section headings present.

---

## Section 2 — Engineering Handoff

### 0. Context & constraints
Static content page; zero runtime dependencies; must not regress bundle (no new deps).
- **Chosen**: single static server component with Tailwind utility classes, `export const metadata`. Matches how existing pages are built.
- **Rejected**: MDX/markdown pipeline (new deps, YAGNI); shadcn/ui (not installed in clipboard-web); client component (unneeded interactivity).

### 1. Target files
| File | Action |
|---|---|
| `clipboard-web/src/app/privacy/page.tsx` | CREATE — the whole feature (≤300 lines incl. text) |

No other files change. No schema, no API, no migrations.

### 2. Imports & dependencies
Only what exists already:
- Nothing beyond React default export. Do NOT import fonts, UI libs, or icons.
- Optional: none. Keep zero imports if possible (`export const metadata` needs `Metadata` type from `"next"` — import type only).

### 3. Component spec — `src/app/privacy/page.tsx`

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How the AI Clipboard extension handles your text and data.",
};

// ---- MUST-EDIT constants (flagged for the user) ----
const CONTACT_EMAIL = "privacy@example.com"; // TODO(owner): replace with real email before CWS submission
const LAST_UPDATED = "August 17, 2026";
```

Structure:
```tsx
export default function PrivacyPage() {
  return (
    <main className="min-h-screen px-6 py-16 sm:px-10 font-[family-name:var(--font-geist-sans)]">
      <article className="mx-auto max-w-2xl flex flex-col gap-10">
        <header> ... h1 "Privacy Policy" + p intro + Last Updated line ... </header>
        <section id="what-we-collect"> h2 + content </section>
        ... 7 more sections ...
        <footer> contact + link back to "/" </footer>
      </article>
    </main>
  );
}
```

Styling conventions (match repo):
- Wrapper: `min-h-screen`, horizontal padding, Geist sans via `font-[family-name:var(--font-geist-sans)]` (root layout injects the variable).
- Content column: `mx-auto max-w-2xl` (readable ~65ch line length).
- `h1`: `text-3xl sm:text-4xl font-bold tracking-tight`
- `h2`: `text-xl sm:text-2xl font-semibold mt-2` (sections already spaced by parent gap)
- `p`: `text-base leading-7 text-neutral-700 dark:text-neutral-300` (h1 default foreground)
- `ul`: `list-disc pl-6 flex flex-col gap-2` with same p styling
- Code/URLs (`chrome.storage.local`, endpoint): `<code className="rounded bg-black/[.05] px-1 py-0.5 dark:bg-white/[.06] font-[family-name:var(--font-geist-mono)] text-sm">` — same pattern as home page.
- Do NOT invent a nav bar; a simple "Back to home" link (`href="/"`) in the footer.

### 4. Policy content (write EXACTLY these claims — grounded in audit)

**Header**: "Privacy Policy" — intro paragraph: plain-words summary: "AI Clipboard is a Chrome extension that transforms text you copy using AI. This page explains, in plain language, what data is involved and how it is handled. Summary: your copied text is sent to our server only when you use a feature, it is processed by AI and not stored on our servers, and your history stays on your device." + "Last updated: {LAST_UPDATED}".

**1. What We Collect**
- Text you explicitly copy while a feature is active (the selection you copied). Nothing is captured until you perform a copy.
- We do NOT collect: names, emails, addresses, browsing history, credentials, or any account information. There are no accounts and no sign-up.
- We do not use analytics, advertising, or tracking of any kind — in the extension or on this website.

**2. How Your Text Is Used**
- When you copy text with a feature enabled, that selection is sent to our backend (`https://clipboard-backend.aieasyuse.workers.dev`) to be processed by an AI model, and the result is returned to you in the extension.
- Your text is used only to generate your requested result. It is not used to train models by us, not sold, not shared for marketing.

**3. Storage & Retention**
- Chat history, settings, and usage counts are stored in `chrome.storage.local` — on your device only. They never leave your device and are never synced.
- Our backend does not store your text: it is processed in memory and discarded when your request completes. We do not keep copies in any database, cache, or log.

**4. AI Processing & Third Parties**
- AI features are powered by Cloudflare Workers AI (Llama 3.3 70B). To process your request, your selected text is transmitted to Cloudflare. Cloudflare acts as our processor/service provider; its handling of request data (including technical metadata such as IP address) is governed by Cloudflare's privacy policy: https://www.cloudflare.com/privacypolicy/
- Apart from Cloudflare (hosting + AI), we do not send your data to any third party.

**5. Browser Permissions**
- `clipboardRead` / `clipboardWrite` — required to capture the text you copy and to place the AI result back on your clipboard. Reading happens only in direct response to your copy action.
- `storage` — saves your settings and history locally on your device.
- `sidePanel`, `tabs`, `scripting`, `alarms` — used to show the history panel and manage the extension's own interface and usage limits; they are not used to monitor your browsing.
- Network access is limited to our own backend domain.

**6. Your Controls**
- View or clear your history anytime from the extension's history panel (reset action).
- Turning a feature off stops text capture immediately.
- Removing the extension from Chrome deletes all locally stored history and settings.

**7. Contact**
- Questions about this policy: `{CONTACT_EMAIL}` (rendered as a `mailto:` link). We aim to respond within a reasonable time.

**8. Last Updated**
- "This policy was last updated on {LAST_UPDATED}. If we make material changes, we will update this page and the date above."

**Footer**: link `← Back to home` → `/`.

Forbidden phrasing (accuracy traps): do NOT write "we never collect any personal information" (absolute — Cloudflare metadata caveat), do NOT write "your data never leaves your device" (text does transit to backend), do NOT claim GDPR/CCPA compliance sections we can't honor — keep it factual and scoped to the extension.

### 5. Component states
Static server-rendered content: no loading/error/empty states, no client JS, no effects. The only interactive elements are two anchor tags (`mailto:` + `/`). Nothing to fail at runtime.

### 6. Edge matrix
| Edge | Expected behavior |
|---|---|
| Mobile viewport (<640px) | Single column, readable padding (`px-6`), no horizontal scroll |
| Dark mode | All text visible via `dark:` variants; code chips contrast correctly |
| Direct navigation to `/privacy` (no client-side nav) | Renders fully server-side (200 + complete HTML) |
| `metadata` | `<title>Privacy Policy</title>` + description present in HTML head |
| Long email / URL overflow | `break-words` on paragraphs containing URLs |

### 7. Test matrix
| Layer | Check |
|---|---|
| Build | `npm run build` in clipboard-web exits 0; route `/privacy` listed as static (SSG) in build output |
| Lint | `npm run lint` exits 0 |
| Content (executable contract) | Script asserts all 8 h2 headings + CONTACT_EMAIL render in served HTML |
| Accessibility | h1 exactly one; sections use h2; link text descriptive; text contrast via neutral-700/300 |
| Visual (QA) | Screenshot light + dark: readable single column, no clipped text |

### 8. Executable test contract
No test framework exists in clipboard-web — do NOT add one (YAGNI). Verification is command-based (see Exit Criteria). Engineer creates NO test files.

### 9. Vertical slice & order
Single slice: page file → build → serve → verify content. One commit.

### 10. Verification Exit Criteria (Engineer MUST check ALL before DONE)
Run from `clipboard-web/` (use `pnpm` — pnpm-lock.yaml is the lockfile; `npm run` scripts also work):
- [ ] `pnpm install` (if needed) then `pnpm build` exits 0 — build output lists `/privacy` as a static route (○/SSG)
- [ ] `pnpm lint` exits 0
- [ ] `pnpm dev` (or `pnpm start` after build) then `curl -s http://localhost:3000/privacy` returns HTTP 200
- [ ] Served HTML contains all 8 headings: "What We Collect", "How Your Text Is Used", "Storage & Retention", "AI Processing & Third Parties", "Browser Permissions", "Your Controls", "Contact", "Last Updated" (verify: `curl -s http://localhost:3000/privacy | grep -c "What We Collect"` etc. — each ≥1)
- [ ] Served HTML contains `privacy@example.com` and `mailto:` link
- [ ] `<title>Privacy Policy</title>` present in served HTML head
- [ ] `grep -n "use client" src/app/privacy/page.tsx` returns nothing (static server component)
- [ ] `wc -l src/app/privacy/page.tsx` ≤ 300
- [ ] File contains `TODO(owner): replace with real email` comment above CONTACT_EMAIL
- [ ] Page HTML contains zero `<script src=` tags beyond Next.js framework chunks (no third-party scripts) — spot-check served HTML

### 11. Security & contract notes
- No secrets, no env vars, no user input, no dynamic routes → no injection surface. The only external URL is the Cloudflare policy link (`rel="noopener noreferrer"`, `target="_blank"`).
- Page must not leak the backend's OpenAI/Stripe key names or any internal details beyond the public endpoint domain.

### 12. Reviewer checklist (Task 4 will audit)
Every rendered claim ↔ audit facts 1–9 above; forbidden phrasing absent; placeholder email present + flagged; sections complete; no absolute false claims.
