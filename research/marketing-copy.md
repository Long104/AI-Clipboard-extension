# AI Clipboard — Landing Page Copy Brief

### 1. Brief Readback
- Product/Feature: AI Clipboard — Copy & Understand (Chrome extension)
- Target Audience: Students, researchers, and power-users reading dense technical docs or papers
- Tone & Voice: Dark Linear/Raycast style, direct, low-friction, zero AI-slop
- Key Differentiator: Inline macOS Look Up–style popovers and clipboard history with on-demand AI, no tab-switching

### 2. Hero Section
- **Headline** (6 words):
  Understand anything faster than ever.
- **Subheadline** (14 words):
  Copy text, get instant summaries, or ask follow-ups in a side panel. Zero tab-switching.
- **Primary CTA**: Add to Chrome
  - Destination URL: `#` (Chrome Web Store placeholder)
- **Secondary CTA**: View on GitHub → `https://github.com/pantorn/AI-Clipboard-extension`
- **Microcopy under CTA**:
  Free tier includes 10 requests every 2 hours. No credit card required.

### 3. Interactive Demo Section
- **Section Caption**:
  Select text or press Cmd+C anywhere. The explanation appears in place.

### 4. Bento Feature Grid
- **Block 1: History with Instant Actions**
  - Title: Smart Clipboard History
  - Body: Recalls recent clips automatically. Run one-click explain or summarize actions directly from the copy toast.
- **Block 2: Inline Look Up Popover**
  - Title: macOS Look Up Everywhere
  - Body: Highlights trigger a lightweight floating card right next to your selection. Read the takeaway without losing your place.
- **Block 3: Side Panel Chat**
  - Title: Deep Dive Side Panel
  - Body: Hit Alt+C to slide out a persistent chat. Ask follow-up questions about selected text without leaving your active tab.
- **Block 4: Local Keys & Worker Privacy**
  - Title: Private by Architecture
  - Body: Custom API keys never leave local browser storage. Free tier requests run ephemerally on Cloudflare Workers AI.
- **Block 5: Zero-Setup Speed**
  - Title: Instant Zero-Setup Use
  - Body: Install and run immediately. No account signup, no API key required to start, and sub-second responses.

### 5. Privacy & Permissions Trust Strip
1. **Zero background surveillance**: AI Clipboard activates only when you select text or trigger an explicit action—it never logs unselected browsing.
2. **Local key isolation**: If you bring your own OpenAI or Anthropic API key, it stays strictly in local browser storage (`chrome.storage.local`).
3. **No training on your data**: Free-tier queries route ephemerally through Cloudflare Workers AI and are discarded immediately after inference.

### 6. Frequently Asked Questions (FAQ)
- **Q1: Is AI Clipboard free to use?**
  - **A**: Yes. You get 10 free AI requests every 2 hours out of the box. If you need unlimited queries, paste your own API key in settings.
- **Q2: Which browsers are supported?**
  - **A**: Google Chrome, Brave, Arc, Microsoft Edge, and any Chromium-based browser supporting Manifest V3.
- **Q3: Does the extension read everything I copy?**
  - **A**: No. It only processes clips when you click an action on the copy toast or select text to trigger an inline explanation. Nothing leaves your browser without user action.
- **Q4: Which AI model powers the explanations?**
  - **A**: The free tier runs Meta Llama 3.3 70B via Cloudflare Workers AI for rapid responses. BYO key supports OpenAI GPT-4o models.
- **Q5: Can I bring my own API key?**
  - **A**: Yes. Open settings and paste your API key for unlimited requests. Your key is stored locally on your machine and communicates directly with the provider.

### 7. Final CTA Section
- **Re-hook**: Stop switching tabs to explain text.
- **CTA Button**: Add to Chrome — It's Free

### 8. SEO Metadata
- **Title Tag**: AI Clipboard — Copy & Understand for Chrome (50 chars)
- **Meta Description**: Instant AI explanations and summaries on any webpage with macOS-style Look Up, clipboard history, and a side panel. Free, private, and fast. (152 chars)
- **H1**: Understand anything faster than ever.
- **OG Description**: Instant AI explanations and summaries on any webpage without switching tabs.
- **URL Slug**: `/`

---

### Open Options & Defaults
- Chrome Web Store link defaults to `#` pending public listing.

### Domain Invariant Finding
- **Audience Objection**: Power-users might worry that a clipboard extension creates visual clutter or interferes with default Ctrl+C hotkeys.
- **Impact**: Users may hesitate to install if they expect intrusive popups on every copy. The landing page addresses this by highlighting configurable toggles for overlays and toasts in settings.

### Anti-Slop Gate
- Passed: Zero banned buzzwords ("revolutionize", "unlock", "supercharge", "seamless", etc.). All claims are concrete, active voice, and under specified word limits.
