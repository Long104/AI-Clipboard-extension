---
name: AI Clipboard Landing Page
version: 1.0.0
description: "Dark Linear/Raycast aesthetic design specification for AI Clipboard (Chrome Extension landing page). Near-black surface ladder (#07080a to #1c1f26), 1px hairline borders (#222733), 95% achromatic palette with high-voltage Electric Lime (#d4ff32) accent strictly reserved for Add to Chrome CTAs, Inter typography with tabular mono numerals, and interactive product mockups."
colors:
  canvas: "#07080a"
  surface-1: "#0e1015"
  surface-2: "#14171f"
  surface-3: "#1c1f26"
  surface-card: "#0d0f14"
  surface-popover: "#0f1219"
  hairline: "#222733"
  hairline-strong: "#2e3545"
  hairline-hover: "#3d465c"
  ink-primary: "#f3f5f8"
  ink-secondary: "#a1a7b5"
  ink-tertiary: "#687082"
  ink-disabled: "#434957"
  accent-lime: "#d4ff32"
  accent-lime-hover: "#e2ff66"
  accent-lime-active: "#c2eb24"
  accent-lime-fg: "#07080a"
  accent-lime-glow: "rgba(212, 255, 50, 0.12)"
  semantic-green: "#22c55e"
  semantic-blue: "#3b82f6"
  semantic-amber: "#f59e0b"
  semantic-red: "#ef4444"
typography:
  display-hero:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSizeDesktop: "64px"
    fontSizeMobile: "38px"
    fontWeight: "700"
    lineHeight: "1.08"
    letterSpacing: "-0.04em"
  h2-section:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSizeDesktop: "40px"
    fontSizeMobile: "28px"
    fontWeight: "600"
    lineHeight: "1.15"
    letterSpacing: "-0.035em"
  h3-card:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSizeDesktop: "20px"
    fontSizeMobile: "18px"
    fontWeight: "600"
    lineHeight: "1.3"
    letterSpacing: "-0.02em"
  body-lead:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSizeDesktop: "18px"
    fontSizeMobile: "16px"
    fontWeight: "400"
    lineHeight: "1.55"
    letterSpacing: "-0.01em"
  body-base:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSizeDesktop: "15px"
    fontSizeMobile: "14px"
    fontWeight: "400"
    lineHeight: "1.5"
    letterSpacing: "-0.005em"
  body-sm:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSizeDesktop: "13px"
    fontSizeMobile: "12px"
    fontWeight: "400"
    lineHeight: "1.45"
    letterSpacing: "0em"
  caption-mono:
    fontFamily: "var(--font-geist-mono), ui-monospace, SFMono-Regular, monospace"
    fontSizeDesktop: "12px"
    fontSizeMobile: "11px"
    fontWeight: "500"
    lineHeight: "1.4"
    letterSpacing: "0.04em"
  eyebrow-caps:
    fontFamily: "var(--font-geist-mono), ui-monospace, SFMono-Regular, monospace"
    fontSizeDesktop: "12px"
    fontSizeMobile: "11px"
    fontWeight: "600"
    lineHeight: "1.2"
    letterSpacing: "0.08em"
rounded:
  xs: "4px"
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  2xl: "20px"
  full: "9999px"
spacing:
  section-y: "96px"
  section-y-mobile: "64px"
  container-max: "1200px"
  container-px: "24px"
  container-px-mobile: "16px"
  grid-gap: "20px"
  grid-gap-sm: "12px"
components:
  cta-primary:
    background: "{colors.accent-lime}"
    color: "{colors.accent-lime-fg}"
    hoverBackground: "{colors.accent-lime-hover}"
    activeBackground: "{colors.accent-lime-active}"
    rounded: "{rounded.md}"
    fontSize: "14px"
    fontWeight: "600"
    height: "44px"
    padding: "0 20px"
  button-secondary:
    background: "{colors.surface-2}"
    color: "{colors.ink-primary}"
    border: "1px solid {colors.hairline}"
    hoverBackground: "{colors.surface-3}"
    hoverBorder: "1px solid {colors.hairline-hover}"
    rounded: "{rounded.md}"
    fontSize: "14px"
    fontWeight: "500"
    height: "44px"
    padding: "0 18px"
  bento-card:
    background: "{colors.surface-card}"
    border: "1px solid {colors.hairline}"
    hoverBorder: "1px solid {colors.hairline-hover}"
    rounded: "{rounded.xl}"
    padding: "28px"
---

# UI/UX Specification: AI Clipboard Landing Page

## 1. Overview & Graphic Identity
- **Product**: AI Clipboard — Copy & Understand (Chrome MV3 Extension)
- **Aesthetic Direction**: **Dark Linear/Raycast Aesthetic**. Deep, near-black canvas (`#07080a`), 4-tier surface ladder (`#0e1015` → `#1c1f26`), 1px precision hairline borders (`#222733`), and crisp typography. 95% monochromatic/achromatic foundation.
- **The One Saturated Accent**: **Electric Lime** (`#d4ff32`). Reserved **exclusively** for high-intent conversion points ("Add to Chrome" CTAs and active install affordances). Secondary actions, UI chrome, and information layers remain neutral.
- **Hero Art Philosophy**: **The Product UI is the Hero**. Centered, high-fidelity interactive HTML/CSS replica of the real extension popover with floating selection triggers and live toast animations. No fake div illustrations or stock illustrations.
- **Constant Target**: Chrome Web Store CTA links point to `/#store-placeholder` with smooth anchor fallback until the public listing is active.

---

## 2. Color System & Token Mappings

### 2.1 CSS Custom Properties (`src/app/globals.css`)
```css
:root {
  /* Surface Ladder */
  --bg-canvas: #07080a;
  --bg-surface-1: #0e1015;
  --bg-surface-2: #14171f;
  --bg-surface-3: #1c1f26;
  --bg-surface-card: #0d0f14;
  --bg-surface-popover: #0f1219;
  
  /* Hairline Borders */
  --border-hairline: #222733;
  --border-hairline-strong: #2e3545;
  --border-hairline-hover: #3d465c;
  
  /* Ink Hierarchy */
  --text-primary: #f3f5f8;
  --text-secondary: #a1a7b5;
  --text-tertiary: #687082;
  --text-disabled: #434957;
  
  /* The Electric Lime CTA Accent */
  --accent-lime: #d4ff32;
  --accent-lime-hover: #e2ff66;
  --accent-lime-active: #c2eb24;
  --accent-lime-fg: #07080a;
  --accent-lime-glow: rgba(212, 255, 50, 0.12);
  --accent-lime-ring: rgba(212, 255, 50, 0.35);

  /* Semantic Highlights */
  --semantic-green: #22c55e;
  --semantic-blue: #3b82f6;
  --semantic-amber: #f59e0b;
  --semantic-red: #ef4444;

  /* Standard Radii */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 20px;
  --radius-full: 9999px;
}
```

### 2.2 Tailwind Config Extension (`tailwind.config.ts`)
```typescript
import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "var(--bg-canvas)",
        surface: {
          1: "var(--bg-surface-1)",
          2: "var(--bg-surface-2)",
          3: "var(--bg-surface-3)",
          card: "var(--bg-surface-card)",
          popover: "var(--bg-surface-popover)",
        },
        hairline: {
          DEFAULT: "var(--border-hairline)",
          strong: "var(--border-hairline-strong)",
          hover: "var(--border-hairline-hover)",
        },
        ink: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)",
          disabled: "var(--text-disabled)",
        },
        lime: {
          DEFAULT: "var(--accent-lime)",
          hover: "var(--accent-lime-hover)",
          active: "var(--accent-lime-active)",
          fg: "var(--accent-lime-fg)",
          glow: "var(--accent-lime-glow)",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "-apple-system", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 35px -5px var(--accent-lime-glow)",
        card: "0 1px 2px 0 rgba(0, 0, 0, 0.4), 0 4px 12px 0 rgba(0, 0, 0, 0.2)",
        popover: "0 12px 36px -4px rgba(0, 0, 0, 0.6), 0 0 0 1px var(--border-hairline)",
      },
    },
  },
  plugins: [],
} satisfies Config;
```

---

## 3. Typography Scale & Font Rules

| Token / Usage | Desktop Size / Leading | Mobile Size / Leading | Weight | Tracking | Family |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Title (`display-hero`)** | `64px` / `1.08` | `38px` / `1.12` | 700 (Bold) | `-0.04em` | Sans (`Inter` / Geist) |
| **Section Heading (`h2-section`)** | `40px` / `1.15` | `28px` / `1.2` | 600 (Semibold) | `-0.035em` | Sans |
| **Card Title (`h3-card`)** | `20px` / `1.3` | `18px` / `1.3` | 600 (Semibold) | `-0.02em` | Sans |
| **Body Lead (`body-lead`)** | `18px` / `1.55` | `16px` / `1.5` | 400 (Regular) | `-0.01em` | Sans |
| **Body Base (`body-base`)** | `15px` / `1.5` | `14px` / `1.5` | 400 (Regular) | `-0.005em` | Sans |
| **Body Small (`body-sm`)** | `13px` / `1.45` | `12px` / `1.45` | 400 (Regular) | `0em` | Sans |
| **Eyebrow Tag (`eyebrow-caps`)** | `12px` / `1.2` | `11px` / `1.2` | 600 (Semibold) | `+0.08em` | Mono (`Geist Mono`) |
| **Code / Micro (`caption-mono`)**| `12px` / `1.4` | `11px` / `1.4` | 500 (Medium) | `+0.04em` | Mono (`Geist Mono`) |

**Typography Discipline**:
- Maximum 1 uppercase eyebrow per 3 sections (used solely on Bento Grid & Privacy Trust strip).
- Tabular figures (`font-variant-numeric: tabular-nums`) enabled on all badges, quotas, and shortcuts.

---

## 4. Structure & Section-by-Section Layout Specs

### 4.0 Sticky Navigation Header
- **Container**: `fixed top-0 inset-x-0 z-50 h-16 bg-canvas/80 backdrop-blur-md border-b border-hairline/80`
- **Max Width**: `max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between`
- **Left**:
  - Logo icon: `24x24` PNG (`/icon.png`) + Wordmark `AI Clipboard` (`text-sm font-semibold text-ink-primary tracking-tight`)
  - Subtle status pill: `Extension v2.0 • MV3 Ready` (`hidden md:inline-flex ml-3 px-2 py-0.5 text-[11px] font-mono text-ink-tertiary bg-surface-2 border border-hairline rounded-full`)
- **Center Nav Links** (`hidden md:flex items-center gap-6 text-sm text-ink-secondary hover:text-ink-primary transition-colors`):
  - `Features` (`#features`), `Demo` (`#demo`), `Architecture` (`#privacy`), `FAQ` (`#faq`)
- **Right Action**:
  - `GitHub` icon link (`h-8 w-8 flex items-center justify-center text-ink-secondary hover:text-ink-primary border border-hairline rounded-md hover:bg-surface-2`)
  - Primary CTA button: `Add to Chrome` (`h-9 px-3.5 bg-lime hover:bg-lime-hover text-lime-fg text-xs font-semibold rounded-md flex items-center gap-1.5 shadow-sm transition-transform active:scale-95`)

---

### 4.1 Hero Section
- **Spacing**: `pt-32 pb-16 sm:pt-40 sm:pb-24 overflow-hidden relative`
- **Background Accent**: Single radial spotlight behind hero: `radial-gradient(ellipse 600px 300px at 50% 15%, rgba(212,255,50,0.06), transparent 70%)`
- **Content Hierarchy**:
  1. **Release Pill**: `inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-2 border border-hairline text-xs text-ink-secondary mb-6`
     - Glowing green dot (`w-1.5 h-1.5 rounded-full bg-semantic-green animate-pulse`) + "Cloudflare Workers AI + Llama 3.3 70B"
  2. **H1 Headline**: `Understand anything faster than ever.` (`text-4xl sm:text-6xl font-bold tracking-[-0.04em] text-ink-primary max-w-3xl mx-auto text-center`)
  3. **Subheadline**: `Copy text, get instant summaries, or ask follow-ups in a side panel. Zero tab-switching.` (`mt-6 text-base sm:text-lg text-ink-secondary max-w-xl mx-auto text-center leading-relaxed`)
  4. **CTA Action Cluster**:
     - `Add to Chrome` (Primary): `h-12 px-6 bg-lime hover:bg-lime-hover active:scale-[0.98] text-lime-fg font-semibold rounded-lg text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-glow transition-all`
       - Icon: Chrome Web Store logomark or Lucide `Download`
       - URL: `/#store-placeholder`
     - `View on GitHub` (Secondary): `h-12 px-6 bg-surface-1 hover:bg-surface-2 active:scale-[0.98] border border-hairline hover:border-hairline-hover text-ink-primary font-medium rounded-lg text-sm sm:text-base flex items-center justify-center gap-2 transition-all`
       - Icon: GitHub SVG (`https://cdn.simpleicons.org/github/f3f5f8`)
       - URL: `https://github.com/pantorn/AI-Clipboard-extension`
  5. **Microcopy Under CTA**:
     - `Free tier includes 10 requests every 2 hours. No credit card required.` (`mt-3 text-xs text-ink-tertiary text-center`)
  6. **Hero Interactive Product Mockup** (See Section 5 for deep spec)

---

### 4.2 Interactive Demo Section
- **ID**: `demo`
- **Spacing**: `py-16 sm:py-24 border-t border-hairline/60 bg-surface-1/40`
- **Header**:
  - `Section Caption`: "Select text or press Cmd+C anywhere. The explanation appears in place." (`text-center text-xl sm:text-2xl font-semibold text-ink-primary tracking-tight`)
  - Subtext: "Three distinct modes tailored to how you read and take notes." (`text-sm text-ink-tertiary text-center mt-2`)
- **Demo Stage**:
  - Browser mockup viewport (`max-w-4xl mx-auto rounded-xl border border-hairline bg-canvas shadow-card overflow-hidden`):
    - Top faux browser bar with URL `arxiv.org/abs/attention-is-all-you-need`
    - High-density academic paper snippet text with an active highlighted sentence.
    - Animated / Tabbed interactive demonstration showing:
      1. **Tab 1: Look Up Popover** (Floating card appearing right beside highlight with instant 2-sentence breakdown)
      2. **Tab 2: Quick Copy Toast** (Bottom/top toast with Explain and Summarize buttons on Cmd+C)
      3. **Tab 3: Side Panel (Alt+C)** (Full slide-over side panel streaming follow-up question answer)

---

### 4.3 5-Block Bento Feature Grid
- **ID**: `features`
- **Spacing**: `py-20 sm:py-28 max-w-6xl mx-auto px-4 sm:px-6`
- **Section Eyebrow & Title**:
  - Eyebrow: `CAPABILITIES` (`text-xs font-mono text-ink-tertiary uppercase tracking-widest text-center`)
  - Headline: `Engineered for deep focus.` (`text-3xl sm:text-4xl font-semibold text-ink-primary tracking-tight text-center mt-2`)
- **Bento Grid Architecture**: `grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5 mt-12`

#### Block 1: Smart Clipboard History
- **Span**: `md:col-span-3 lg:col-span-4` (Wide lead card)
- **Background**: `bg-surface-card border border-hairline rounded-xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group`
- **Content**:
  - Title: `Smart Clipboard History`
  - Body: `Recalls recent clips automatically. Run one-click explain or summarize actions directly from the copy toast.`
- **Visual Element**: Interactive replica of the Copy Toast UI (`w-full max-w-sm mx-auto mt-6 bg-surface-popover border border-hairline-strong rounded-lg p-3 shadow-lg flex items-center justify-between`) with active "✓ Captured" checkmark and quick-action pills `[⚡ Explain]` `[📄 Summarize]`.

#### Block 2: Inline Look Up Popover
- **Span**: `md:col-span-3 lg:col-span-2` (Tall card)
- **Background**: `bg-surface-card border border-hairline rounded-xl p-6 sm:p-8 flex flex-col justify-between`
- **Content**:
  - Title: `macOS Look Up Everywhere`
  - Body: `Highlights trigger a lightweight floating card right next to your selection. Read the takeaway without losing your place.`
- **Visual Element**: Mini popover card mockup with `[Sparkles] Explain` header and rendered markdown bullet points.

#### Block 3: Side Panel Chat
- **Span**: `md:col-span-3 lg:col-span-2`
- **Background**: `bg-surface-card border border-hairline rounded-xl p-6 sm:p-8 flex flex-col justify-between`
- **Content**:
  - Title: `Deep Dive Side Panel`
  - Body: `Hit Alt+C to slide out a persistent chat. Ask follow-up questions about selected text without leaving your active tab.`
- **Visual Element**: Code-style chat bubble with user highlight block + AI streaming response badge.

#### Block 4: Private by Architecture
- **Span**: `md:col-span-3 lg:col-span-2`
- **Background**: `bg-surface-card border border-hairline rounded-xl p-6 sm:p-8 flex flex-col justify-between`
- **Content**:
  - Title: `Private by Architecture`
  - Body: `Custom API keys never leave local browser storage. Free tier requests run ephemerally on Cloudflare Workers AI.`
- **Visual Element**: Schematic lock icon + `chrome.storage.local` badge with zero-cloud storage tag.

#### Block 5: Instant Zero-Setup Use
- **Span**: `md:col-span-3 lg:col-span-2`
- **Background**: `bg-surface-card border border-hairline rounded-xl p-6 sm:p-8 flex flex-col justify-between`
- **Content**:
  - Title: `Instant Zero-Setup Use`
  - Body: `Install and run immediately. No account signup, no API key required to start, and sub-second responses.`
- **Visual Element**: Latency metric card: `⚡ <320ms TTFT` on Cloudflare Edge with 0 registration inputs.

---

### 4.4 Privacy & Permissions Trust Strip
- **ID**: `privacy`
- **Spacing**: `py-16 sm:py-20 border-y border-hairline bg-surface-1/30`
- **Container**: `max-w-5xl mx-auto px-4 sm:px-6`
- **Layout**: 3-column structured trust comparison (`grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8`)
- **Pillars**:
  1. **Zero Background Surveillance**
     - Icon: Lucide `EyeOff` (`text-ink-secondary mb-3`)
     - Text: `AI Clipboard activates only when you select text or trigger an explicit action—it never logs unselected browsing.`
  2. **Local Key Isolation**
     - Icon: Lucide `KeyRound` (`text-ink-secondary mb-3`)
     - Text: `If you bring your own OpenAI or Anthropic API key, it stays strictly in local browser storage (chrome.storage.local).`
  3. **No Training on Your Data**
     - Icon: Lucide `ShieldCheck` (`text-ink-secondary mb-3`)
     - Text: `Free-tier queries route ephemerally through Cloudflare Workers AI and are discarded immediately after inference.`

---

### 4.5 Frequently Asked Questions (FAQ Accordion)
- **ID**: `faq`
- **Spacing**: `py-20 sm:py-28 max-w-3xl mx-auto px-4 sm:px-6`
- **Header**:
  - Title: `Frequently Asked Questions` (`text-3xl font-semibold text-ink-primary tracking-tight text-center`)
  - Subtitle: `Everything you need to know about keys, models, and limits.` (`text-sm text-ink-tertiary text-center mt-2 mb-10`)
- **Component**: Clean Radix / shadcn-style accordion with 1px hairline dividers:
  - **Q1: Is AI Clipboard free to use?**
    - A: Yes. You get 10 free AI requests every 2 hours out of the box. If you need unlimited queries, paste your own API key in settings.
  - **Q2: Which browsers are supported?**
    - A: Google Chrome, Brave, Arc, Microsoft Edge, and any Chromium-based browser supporting Manifest V3.
  - **Q3: Does the extension read everything I copy?**
    - A: No. It only processes clips when you click an action on the copy toast or select text to trigger an inline explanation. Nothing leaves your browser without user action.
  - **Q4: Which AI model powers the explanations?**
    - A: The free tier runs Meta Llama 3.3 70B via Cloudflare Workers AI for rapid responses. BYO key supports OpenAI GPT-4o models.
  - **Q5: Can I bring my own API key?**
    - A: Yes. Open settings and paste your API key for unlimited requests. Your key is stored locally on your machine and communicates directly with the provider.

---

### 4.6 Final CTA & Footer
- **ID**: `cta`
- **CTA Section**:
  - **Container**: `py-24 sm:py-32 relative overflow-hidden bg-gradient-to-b from-canvas to-surface-1 border-t border-hairline`
  - **Re-hook**: `Stop switching tabs to explain text.` (`text-3xl sm:text-5xl font-bold tracking-tight text-ink-primary text-center max-w-2xl mx-auto`)
  - **CTA Button**:
    - `Add to Chrome — It's Free` (`mt-8 h-12 px-8 bg-lime hover:bg-lime-hover active:scale-[0.98] text-lime-fg font-semibold rounded-lg text-base mx-auto flex items-center justify-center gap-2 shadow-glow transition-all`)
  - **Microcopy**: `Instant setup • 10 free requests / 2 hrs • Chromium MV3`
- **Footer**:
  - **Container**: `py-10 border-t border-hairline/80 max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-tertiary`
  - **Left**: `© 2026 AI Clipboard. Open source under MIT License.`
  - **Links**: `Privacy Policy` (`/privacy`), `GitHub Repo` (`https://github.com/pantorn/AI-Clipboard-extension`), `Changelog` (`#`)

---

## 5. Hero Product Mockup Spec (HTML/CSS Replica)

The Engineer will render a **pure HTML/CSS replica** of the extension UI directly in React.

### 5.1 Structure & Dimensions
- **Container**: `w-full max-w-[620px] mx-auto mt-12 sm:mt-16 p-3 sm:p-4 rounded-2xl bg-surface-1 border border-hairline-strong shadow-popover relative`
- **Faux Window Chrome**:
  - 3 macOS dots (`w-2.5 h-2.5 rounded-full bg-[#2a2e39]` with hover color hints `#ef4444`, `#f59e0b`, `#22c55e`)
  - Center simulated active tab pill: `📄 research_paper_rag.pdf` (`text-[11px] font-mono text-ink-tertiary`)
- **Simulated Browser Body**:
  - Mock text selection block:
    > "Transformer architectures leverage self-attention mechanisms to compute representations of their input and output without using sequence-aligned RNNs or convolution."
  - **Floating Action Pill** hovering directly above the selection:
    - Pill container: `rounded-full bg-surface-3/95 backdrop-blur-md border border-hairline-strong px-3 py-1.5 shadow-lg flex items-center gap-2 text-xs font-medium text-ink-primary`
    - Action 1: `✨ Explain` (Active state with subtle lime highlight ring)
    - Separator: `h-3 w-px bg-hairline`
    - Action 2: `📄 Summarize`
    - Separator: `h-3 w-px bg-hairline`
    - Action 3: `📋 Copy`
  - **Result Popover Card** anchored below the selection:
    - Popover container: `w-full max-w-[420px] rounded-xl bg-surface-popover border border-hairline-strong shadow-2xl p-4 mt-3 ml-auto sm:mr-4 animate-in fade-in zoom-in-95 duration-200`
    - Header: `Sparkles` icon + `Explain` title + `X` close button
    - Content body:
      - Clean 2-sentence takeaway:
        `"Instead of processing words sequentially like traditional RNNs, transformers weigh the relevance of all words in a sentence simultaneously using self-attention."`
      - Metadata tag: `⚡ 280ms • Llama 3.3 70B (Cloudflare Workers AI)`
    - Footer buttons: `[Copy]` `[Open in Side Panel Alt+C]`

---

## 6. Motion & Microinteraction System

- **Philosophy**: Motion reveals content and gives feedback. Motion never decorates.
- **Library**: CSS Transitions / Tailwind default utilities or lightweight `framer-motion` if already present. No heavy animation dependencies.
- **Timing & Curves**:
  - Button press feedback: `150ms ease-out`, `active:scale-[0.97]`
  - Dropdown / Accordion expand: `200ms cubic-bezier(0.16, 1, 0.3, 1)`
  - Card hover border transitions: `transition-colors duration-200`
  - Popover mockup appear: `200ms ease-out`
- **Banned**: Spinning decorative logos, continuous floating particle canvas, elastic bounce on static cards.
- **Reduced Motion**: All transforms collapse to `opacity` crossfades when `@media (prefers-reduced-motion: reduce)` is enabled.

---

## 7. Component Inventory & Source Map

| Section | Recommended shadcn / 21st.dev Component Archetype | Implementation Strategy |
| :--- | :--- | :--- |
| **Header** | `navbar-navigation` (Linear style) | Custom composite using standard `<Button>` + Lucide icons |
| **Hero** | `hero-centered` + Product Mockup | Custom React component with Tailwind tokens |
| **Demo Stage** | Interactive Tabbed Mockup View | Tabs primitive (`@radix-ui/react-tabs` or custom state tab switch) |
| **Bento Grid** | `features-features` / `features-bento-grid` | 6-column CSS grid with customized `bento-card` containers |
| **Trust Strip** | 3-Column Feature Cards | Pure Tailwind flex/grid layout |
| **FAQ** | `@radix-ui/react-accordion` (`Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`) | Standard shadcn accordion |
| **Final CTA** | `cta-banner` | Clean dark card banner with radial lime glow |
| **Buttons** | shadcn `Button` (`default`, `secondary`, `ghost`, `outline`) | Standardize on `--radius-md` (8px) |

---

## 8. Assets Inventory

### 8.1 Existing Assets (Ready to use)
- `clipboard-extension/assets/icons/icon512.png` → Master high-res app icon.
- `clipboard-extension/assets/icons/icon32.png` / `icon128.png` → Favicons & metadata icons.
- `clipboard-web/public/icon.png` → Standard Next.js metadata icon.

### 8.2 Engineer Implementation Tasks (Zero External Asset Blockers)
- **Chrome Store SVG Badge**: Render as a crisp inline SVG / Lucide `Download` CTA button with standard Chrome typography.
- **GitHub Logo**: Sourced from Simple Icons CDN (`https://cdn.simpleicons.org/github/f3f5f8`) or inline SVG.
- **UI Mockup**: Rendered 100% in React/Tailwind code using the extension popover structure.

---

## 9. Accessibility (a11y) & Hard Gates

1. **Contrast Ratios (WCAG AA)**:
   - Primary text (`#f3f5f8`) on Canvas (`#07080a`): **18.2:1** (Passes AAA).
   - Secondary text (`#a1a7b5`) on Canvas: **7.8:1** (Passes AAA).
   - Electric Lime CTA (`#d4ff32`) with Dark FG (`#07080a`): **16.1:1** (Passes AAA).
2. **Touch Targets**: All CTA buttons maintain `min-height: 44px` on mobile and `min-height: 36px` on desktop.
3. **Keyboard Focus**: `:focus-visible` states strictly defined with `ring-2 ring-lime/50 ring-offset-2 ring-offset-canvas`.
4. **HTML Semantic Hierarchy**: Exactly ONE `<h1>` tag in the hero; all section heads use `<h2>`; all cards use `<h3>`.

---

## 10. Domain Invariant Finding

- **Missing State / Risk**: Power users fear that installing an AI clipboard extension will intercept every `Cmd+C` with intrusive popups or slow down clipboard operations.
- **UX Solution in Spec**: Explicitly highlight the **Settings Toggle** feature and **Privacy Guarantees** in the Bento grid and FAQ ("Zero Background Surveillance" + "Configurable Toasts & Shortcuts").
