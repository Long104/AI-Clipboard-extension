# AI Clipboard — Product Brief (research cache)

## Product
AI Clipboard — Copy & Understand. Chrome extension (Plasmo + React 18 + Tailwind). Monorepo: clipboard-extension, clipboard-backend (Cloudflare Workers AI), clipboard-web (Next.js landing scaffold).

Plain terms: Select any text or copy content → instant AI explanation on the page or in a side panel. No separate app or website needed.

## Features
- Clipboard history: automatic capture on Ctrl+C/Cmd+C, toast with Explain/Summarize actions
- Inline result popover: macOS Look Up–style floating AI card next to selections (Copy / Open in Chat)
- AI actions: Explain, Summarize (+ translation models in backend)
- AI side panel: full chat for follow-ups (Alt+C)
- Settings: BYO API key (unlimited) vs free mode (10 requests / 2 hours), overlay pill + copy toast toggles
- Privacy: API key stored locally only; free mode runs Cloudflare Workers AI

## AI stack
- Primary: Meta Llama 3.3 70B (Cloudflare Workers AI, `@cf/meta/llama-3.3-70b-instruct-fp8-fast`)
- Secondary: OpenAI GPT-4o
- BART + M2M100 (translation)

## Target user
Students, note-takers, researchers — instant text understanding.

## Differentiators
AI understanding on-demand (not just storage), quick inline AND full chat, free tier + BYO key, macOS-style Look Up UI on any page.

## Brand assets
- Name: "AI Clipboard — Copy & Understand"
- Icons: icon16/32/48/128/512.png in clipboard-extension/assets/icons/
- logo.png, icon.png (clipboard-web/ + assets)
- Tagline: "Understand anything faster than ever"
- Screenshots: demo image in README, privacy_full.png, privacy_mobile.png (root)

## Store status
NOT published to Chrome Web Store yet. MV3 ready for packaging (`pnpm --prefix clipboard-extension package`, worklog 2026-08-17).

## Pricing
Free: 10 AI requests / 2 hours. BYO API key: unlimited.

---
*Saved by Entrepreneur from discover task, 2026-08-20*
