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

# 3. Build production bundle
pnpm build
```

### Loading in Chrome

1. Open Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode** (top-right toggle).
3. Click **Load unpacked**.
4. Select `clipboard-extension/build/chrome-mv3-prod/`.
5. Pin the extension icon and press `Alt+C` (or `Option+C`) to open the AI Sidepanel.

---

## 🛠️ Architecture

Monorepo workspace structure:

- `clipboard-extension/` — Chrome Extension Manifest V3 built with Plasmo framework, React 18, Tailwind CSS, Lucide icons.
- `clipboard-backend/` — Cloudflare Workers AI backend running `@cf/meta/llama-3.3-70b-instruct-sd`.
- `clipboard-web/` — Web landing page.

---

## 📄 License

MIT © [Long104](https://github.com/Long104)
