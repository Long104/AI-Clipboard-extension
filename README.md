# AI Clipboard — Copy & Understand

> Understand anything faster than ever. Select text or copy (`Ctrl+C` / `Cmd+C`), and get instant AI explanations right on the page or inside your side panel. Powered by Meta Llama 3.3 70B & Cloudflare Workers AI.

![Demo](https://github.com/user-attachments/assets/96e18b12-1c50-45c7-8caf-565467eab06e)

---

## ✨ Features

- 💡 **Inline Result Popover (macOS Look Up style)** — Click *Explain* or *Summarize* on selected text to get an instant floating AI card right next to your selection, with `✕` close, Copy, and *Open in Chat*.
- 📋 **Copy Capture Toast** — Press `Ctrl+C` / `Cmd+C` on any text → top-right corner toast appears with instant *Explain* & *Summarize* actions.
- 💬 **Interactive AI Side Panel** — Ask follow-up questions, dive deeper into technical concepts, or chat freely with your AI assistant. Toggle anytime with `Alt+C` (or `Option+C`).
- ⚙️ **Settings & Custom Keys** — BYO API Key mode for unlimited usage, or use free worker mode (10 requests / 2 hours). Toggle overlay pill and copy toast on/off.
- 🎨 **Linear/Raycast Minimal UI** — Built with Geist typography, slate palette, and modern shadcn design tokens.

---

## 🚀 Quick Setup (Development / Load Unpacked)

### Requirements

- **Node.js**: 18+
- **Package Manager**: `pnpm`

### Installation

```bash
# 1. Clone repo
git clone https://github.com/Long104/AI-Clipboard-extension.git
cd AI-Clipboard-extension/clipboard-extension

# 2. Install dependencies
pnpm install

# 3. Build production bundle (Chrome)
pnpm build
```

### Loading in Chrome

1. Open Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode** (top-right toggle).
3. Click **Load unpacked**.
4. Select `clipboard-extension/build/chrome-mv3-prod/`.
5. Pin the extension icon and press `Alt+C` (or `Option+C`) to open the AI Sidepanel.

### Loading in Firefox

```bash
# Build the Firefox bundle (Manifest V3 with sidebar_action)
pnpm build_firefox
```

1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on…**.
3. Select the manifest inside `clipboard-extension/build/firefox-mv3-prod/`.
4. Open the sidebar with the toolbar icon or press `Alt+C`.

> Temporary add-ons are removed on Firefox restart — install the signed version from [Firefox Add-ons (AMO)](https://addons.mozilla.org/) for permanent use (the gecko ID is pre-configured in `package.json`).

---

## 🛠️ Architecture

Monorepo workspace structure:

- `clipboard-extension/` — Browser extension (Chrome & Firefox) — Manifest V3, built with Plasmo framework, React 18, Tailwind CSS, Lucide icons. Chrome uses the Side Panel API; Firefox uses the Sidebar API (`sidebar_action`) — same codebase, per-target builds.
- `clipboard-backend/` — Cloudflare Workers AI backend running `@cf/meta/llama-3.3-70b-instruct-sd`.
- `clipboard-web/` — Web landing page.

---

## 📄 License

MIT © [Long104](https://github.com/Long104)
