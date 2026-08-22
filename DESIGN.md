# DESIGN.md — AI Clipboard Landing Page

## Emotional Register
**calm/elevated** — warm, tactile, editorial, zero hustle-culture AI tropes. The interface gets out of the way; the product does the talking.

## Reference DNA
**Internal Product UI (`clipboard-extension` light theme)**
- Direct alignment with the Chrome extension's own light-first visual language.
- Primary brand accent: Blue-600 (`#2563EB`) — action-only, zero decorative glow.
- Canvas: Warm White (`#FAFAF8`), ink (`#1A1A1A`), elevated card surface (`#FFFFFF`).
- No borrowing from Linear/Raycast/Apple — identity is the product itself.

## Typography Pipeline
- **Display (Hero & Section Headlines)**: Cabinet Grotesk (weight 800, tracking `-0.04em`), self-hosted via `@fontsource/cabinet-grotesk`.
- **Body**: Clean system-ui stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`), weight 400, leading relaxed.
- **Data / Keycaps / Numerical stamps**: JetBrains Mono (`monospace`), weight 400–500, tabular figures.
- **Rule**: Display face ≠ body stack. Max 1 bold/extrabold per section. No all-caps tracking kickers.

## Color System (60-30-10)
- **60% Background**: `--canvas` (`#FAFAF8` / `oklch(0.98 0.003 95)`)
- **30% Content/Surfaces**: `--surface` (`#FFFFFF`), `--ink` (`#1A1A1A` / `oklch(0.20 0.005 60)`), `--ink-muted` (`#737373`)
- **10% Brand Accent**: `--primary` (`#2563EB` / `oklch(0.55 0.24 262)` — chroma 0.24 ≤ 0.4 verified PASS)
- **Selection Highlight Tint**: `color-mix(in oklch, var(--primary) 14%, transparent)`
- **Neutrals**: Warm-tinted (`neutrals: warm`). Zero default Tailwind `gray-*` ramp.
- **Banned**: Purple gradients, card top-edge accent strips, dark mode without logged exception.

## Signature Motif
**Selection Highlight (`motif-selection`)** — product-native text-selection aesthetic reflecting the core "select text to understand" interaction.
- Appears on ≥4 surfaces: Hero headline, How-it-works step cards, FAQ answer emphasis, Final CTA headline.
- Implementation: `.motif-selection` utility with 14% primary background mix, primary color, 2px radius, inline padding.

## Non-Negotiables
1. Product-first hero: real working 5-state interactive demo engine (idle → selected → streaming → success → quota conversion).
2. Motion reveals only — zero decorative animation, no particles, no count-ups, `prefers-reduced-motion` fully respected.
3. No uniform card grids — asymmetric 60/40 editorial rows, hairline dividers, generous whitespace.
4. WCAG AA compliant on all token pairs.

## Decisions
- 2026-08-22 — `register: calm/elevated` — editorial warmth, no hustle-AI tropes.
- 2026-08-22 — `dna: clipboard-extension-light` — self-DNA aligned with extension light theme.
- 2026-08-22 — `display-face: cabinet-grotesk-800` — via @fontsource/cabinet-grotesk, tracking -0.04em.
- 2026-08-22 — `neutrals: warm` — #FAFAF8 canvas, #1A1A1A ink, #E5E5E0 hairline borders. Default gray ramp banned.
- 2026-08-22 — `chroma-audit: #2563EB = oklch(0.55 0.24 262) — chroma 0.24 <= 0.4 PASS` — blue-600 retained.
- 2026-08-22 — `motif: selection-highlight — placements: hero, how-it-works, faq, final-cta` — product-native text-selection device.
- 2026-08-22 — `theme-mode: light-only` — opt-in dark mode disabled for marketing landing page to preserve warm-white editorial register.
