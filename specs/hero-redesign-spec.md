# Spec: Landing Hero Redesign (Centred Editorial Graphic)

**Date**: 2026-08-22  
**Status**: Approved (User confirmed 2026-08-22)  
**Target App**: `clipboard-web/` (Next.js 15.5.23 + Tailwind v4 + Light-only theme)  
**Style DNA**: Linear / Raycast warm-white graphic — ambient mesh lighting, delicate hairline grid, frosted glass floating fragments, editorial layout.

---

## 1. Goal

Transform the hero fold from a generic "headline-stacked-on-top-of-article" layout into a **centred editorial hero composition** where:
1. The headline and core value prop sit calmly in the centre (slightly above midpoint).
2. Three crisp, frosted product fragments float *around* the headline like a graphic design scene:
   - **Fragment A (Lower-Left)**: Action toolbar pill (`[Summarize | Explain | Action Items | Copy]`) attached to a snippet of highlighted text.
   - **Fragment B (Upper-Right)**: Selection state snippet (`"...between input and output..."` with selection tooltip `"Select any text"`).
   - **Fragment C (Lower-Right)**: AI summary result card with green checkmark + bullets.
3. Warm ambient mesh background (subtle primary + amber radial glow) + delicate hairline grid overlay so the canvas feels physical, elevated, and dimensional.
4. **Live interactive arXiv demo** moves to its own dedicated section immediately following the hero: `playground-section.tsx` ("Try it yourself in real time" with reader window chrome `● ● ●`).
5. **Navbar**: Floating frosted pill with `backdrop-blur-md`, `border-black/[0.08]`, crisp typography.

---

## 2. Component Architecture

```text
src/
├── app/
│   ├── globals.css              <- Add hairline grid + ambient mesh utilities
│   └── page.tsx                 <- Composes Header, Hero, PlaygroundSection, HowItWorks, etc.
└── components/
    ├── header.tsx               <- Floating frosted pill navbar
    ├── hero.tsx                 <- Centred headline + 3 floating frosted fragments
    ├── playground-section.tsx   <- Dedicated live interactive demo section (new)
    ├── demo/
    │   ├── article-canvas.tsx   <- Retained for playground-section
    │   └── hero-fragments.tsx   <- Fragment A, B, C visual cards (static/subtle float)
    ├── how-it-works.tsx
    ├── feature-rows.tsx
    ├── side-panel-demo.tsx
    ├── privacy-strip.tsx
    ├── faq.tsx
    └── final-cta.tsx
```

---

## 3. Detailed Specifications

### 3.1 Background: Ambient Mesh & Grid (`globals.css`)
- **Mesh Background**: Subtle radial gradient lighting centered on the hero fold:
  - `radial-gradient(ellipse at 50% 20%, rgba(37,99,235,0.06) 0%, transparent 60%)` (subtle blue primary ambient)
  - `radial-gradient(ellipse at 20% 40%, rgba(245,158,11,0.03) 0%, transparent 40%)` (warm amber undertone)
- **Hairline Grid**: 48px grid using `linear-gradient` with `rgba(0,0,0,0.025)` mask-faded from 0% to 80% opacity so it dissolves naturally toward the fold bottom.

### 3.2 Floating Frosted Navbar (`header.tsx`)
- Fixed floating pill pinned to top with `top-4 max-w-5xl mx-auto px-4 z-50`.
- Surface: `bg-[#FAFAF8]/80 backdrop-blur-md border border-black/[0.07] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-full px-5 py-2.5`.
- Elements: Logo (`/logo.png`) + "AI Clipboard", nav links (How it works, Playground, Privacy, FAQ), CTA `Add to Chrome — Free` (tactile black pill or solid primary).

### 3.3 Centred Hero (`hero.tsx` + `hero-fragments.tsx`)
- Container: `relative min-h-[85vh] flex flex-col items-center justify-center pt-28 pb-16 px-4 overflow-hidden`.
- **Centre Content**:
  - `h1`: Cabinet Grotesk 800 display `-0.04em`, 48px–72px responsive, single bold tier. Signature highlight motif on `"faster than ever."`.
  - Subtitle: System sans, 18px/28px, `#525252`, max-w-xl.
  - CTAs: Primary `Add to Chrome` + Secondary `View on GitHub →`.
  - Trust: `Free tier includes 10 requests every 2 hours. No credit card required.` (13px, `#737373`).
- **Floating Graphic Fragments** (Absolute positioned on desktop `lg:block`, hidden/stacked gracefully on mobile `<1024px`):
  - **Fragment A (Lower-Left)**:
    - Position: `left-6 lg:left-12 bottom-12`, slight rotate `-2deg`.
    - Card: Frosted white card (`bg-white/90 backdrop-blur-md border border-black/[0.08] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] rounded-xl p-3.5 max-w-xs`).
    - Content: Highlighted text snippet + floating blue pill `[Summarize | Explain | Action Items | Copy]` (matches user's Image 1 & Image 2).
  - **Fragment B (Upper-Right)**:
    - Position: `right-8 lg:right-16 top-28`, slight rotate `2.5deg`.
    - Card: Mini text block with selection tooltip `Select any text` blue pill tooltip arrow (matches user's Image 2).
  - **Fragment C (Lower-Right)**:
    - Position: `right-6 lg:right-12 bottom-8`, slight rotate `1deg`.
    - Card: `bg-white/90 backdrop-blur-md border border-black/[0.08] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] rounded-xl p-4 max-w-sm`.
    - Content: `✓ Summarize · Done`, `Summary: Transformer Architecture` + 2 bullet points (matches user's Image 3).

### 3.4 Dedicated Playground Section (`playground-section.tsx`)
- Clean visual transition with hairline top border.
- Header:
  - Overline: `Interactive Playground` (12px, font-medium, `#737373`, NO uppercase tracking).
  - Heading: `Try it yourself in real time.` (32px, Cabinet Grotesk).
  - Subtitle: `Select any sentence in the paper below, or click a quick action. Zero setup needed.`
- Reader Window Surface:
  - Mac window chrome: `● ● ●` red/yellow/green dots, document badge `arXiv:1706.03762 · Attention Is All You Need · 12 min read`.
  - Embedded `article-canvas.tsx` with live 5-state interactive popover engine.

---

## 4. DESIGN.md Compliance Checklist
- [x] Font: Cabinet Grotesk 800 for h1/h2 headings; System sans for body; JetBrains Mono for metadata.
- [x] Bold hierarchy: exactly ≤1 bold element per section.
- [x] No `uppercase tracking-*` (banned per craft floor).
- [x] Colors: warm white `#FAFAF8`, black `#1A1A1A`, primary `#2563EB`, subtle borders `border-black/[0.07]`.
- [x] Signature motif: `.motif-selection` applied to hero h1 `"faster than ever."` and fragment selections.
- [x] Light theme only.
