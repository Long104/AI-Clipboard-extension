# Raycast Design System + Motion (DesignMD capture, slug: raycast)

> Fidelity note: token values verbatim from designmd_get_full_system(raycast). Palette will be remapped to extension theme per user — see "Remap" section at bottom.

## Core identity
Marketing page = extended product screenshot. Dark-only canvas, surface ladder elevation (NO drop shadows), hairline 1px borders, Inter with `font-feature-settings: "calt","kern","liga","ss03"` site-wide, single white CTA pill, saturated accents ONLY inside illustrations (never chrome), signature diagonal stripe gradient in hero band exactly once per page.

## Colors (Raycast originals)
- primary #ffffff / pressed #e8e8e8 / on-primary #000000
- ink #f4f4f6, body #cdcdcd, charcoal #d3d3d4, mute #9c9c9d, ash #6a6b6c, stone #434345
- on-dark #ffffff, on-dark-mute rgba(255,255,255,0.72)
- canvas #07080a, surface #0d0d0d, surface-elevated #101111, surface-card #121212, button-fg #18191a
- hairline #242728, hairline-soft rgba(255,255,255,0.08), hairline-strong rgba(255,255,255,0.16)
- accents (ILLUSTRATIONS ONLY): blue #57c1ff, red #ff6161, green #59d499, yellow #ffc533 (+ 15% alpha softs)
- hero-stripe gradient #ff5757 → #a1131a (once per page max)
- keycap gradient #121212 → #0d0d0d

## Typography — Inter, feature settings "calt","kern","liga","ss03" everywhere
| Token | Size | Weight | LH | Tracking |
|---|---|---|---|---|
| display-xl | 64px | 600 | 1.1 | 0 |
| display-lg | 56px | 500 | 1.17 | 0.2px |
| heading-xl | 24px | 500 | 1.6 | 0.2px |
| heading-lg | 22px | 500 | 1.15 | 0 |
| heading-md | 20px | 500 | 1.4 | 0.2px |
| heading-sm | 18px | 500 | 1.4 | 0.2px |
| body-lg | 18px | 400 | 1.6 | 0 |
| body-md | 16px | 400 | 1.6 | 0 |
| body-strong | 16px | 500 | 1.4 | 0.2px |
| body-sm | 14px | 400 | 1.6 | 0 |
| body-sm-strong | 14px | 500 | 1.6 | 0.2px |
| caption-md | 13px | 400 | 1.4 | 0.1px |
| caption-sm | 12px | 400 | 1.5 | 0.4px |
| link-md | 16px | 500 | 1.4 | 0.3px |
| button-md | 14px | 500 | 1.6 | 0.2px |

Display tier adds ss02/ss08, liga:0 for wordmark. Letter-spacing consistently positive at small sizes.

## Radius
xs 4px (keycaps/badges) · sm 6px (palette rows) · md 8px (buttons/inputs/icon tiles) · lg 10px (feature cards) · xl 16px (hero mockup container) · full (pills). Never 0 on cards, never >16 except pills.

## Spacing
2/4/8/12/16/24/32 · section rhythm 96px (64px tablet, 48px mobile). In-card padding 16–24px (never 32+). Card gutters 16px. Container ~1240px, hero mockup ~1080px, full-bleed background.

## Components (key specs)
- **button-primary**: bg primary, text on-primary, button-md, 8px 16px pad, h36, r-md. THE universal CTA. Max ONE solid pill per fold.
- **button-secondary**: transparent, on-dark text, r-md.
- **button-tertiary**: bg surface-elevated, on-dark, r-md.
- **install-button**: transparent, 1px hairline-strong border, 6px 14px, r-md.
- **pill-tab / active**: transparent→surface-elevated, body-sm, r-full.
- **badge-pro**: surface-elevated bg, on-dark-mute, caption-sm, r-xs.
- **badge-info-soft**: accent-soft bg, accent text, caption-sm, r-xs.
- **text-input / search-bar**: surface-elevated bg, hairline border → hairline-strong on focus (NO colored ring), h36/44, r-md.
- **command-palette-card**: surface bg, hairline border, r-lg/xl, padding 0. Header = traffic-light dots + search row; rows stack; keycap cluster bottom-right. THE hero visual.
- **command-palette-row / active**: transparent → surface-card bg, body-md, 6px 10px, r-sm. Row = icon tile + label + keycap hint.
- **feature-card-dark / elevated**: surface / surface-elevated, hairline, 24px pad, r-lg. Alternate to break rhythm.
- **store-extension-card**: surface, hairline, 16px pad, r-md; 48px icon tile left, copy center, install-button right.
- **keycap**: surface-card bg + key gradient, body text, caption-md, 1px 6px, h20, r-xs. e.g. `⌘ K`, `⏎`, `Esc`.
- **app-icon-tile**: surface-card, 48/64px, r-md.
- **primary-nav**: canvas bg, 56px h, body-sm-strong, hairline bottom rule. Wordmark left, centered links, white pill right (always visible).
- **footer**: canvas, body-sm, 64/48px pad, hairline top rule, 6-col links, newsletter input + pill. Faint stripe echo at top.
- **hero-stripe-band**: canvas, diagonal stripe gradient top half, display-xl headline, ONE button-primary. Once per page.

## Elevation
0 flat · 1 hairline border · 2 hairline-strong · 3 surface-ladder step. NO drop shadows anywhere.

## Do's
- Dark-only. White pill = every primary CTA. Elevation via surface ladder only. ss03 enabled. Command-palette mockup anchors hero. Keycaps for shortcuts. Stripe gradient once, hero only. Accents only in illustrations.

## Don'ts
- No light mode. No drop shadows. No tinted accent CTA (in Raycast's system). No saturated accent on text/buttons/chrome. No stripe gradient below hero. No Inter without ss03. No 32px+ card padding.

## Responsive
1240px content holds; ultrawide gutters 80px. 1024: 3-up→2+1. 768: hamburger drawer, 1-up grids. 480: single column, display-xl 64→36px. Section 96→64→48px. Touch targets ≥36px.

## Motion (Raycast)
Philosophy: feel faster than it is. Springs front-load arrival. Keyboard nav = 0ms highlight (absolute).
- Durations: instant 0 (keyboard/hover/focus) · micro 50 (icon color, badges) · fast 100 (tooltip, panel enter) · default 130 (list entrance) · medium 160 (panel slide) · slow 200 (walkthrough).
- Easing: ease-out cubic-bezier(0.16,1,0.3,1) entering · ease-in cubic-bezier(0.7,0,0.84,0) exiting · ease-in-out (0.45,0,0.55,1) repositioning.
- Springs (Framer Motion): Window stiffness 550/damping 36/mass 0.8 · Results 480/34/0.9 · Panel 400/32/1 · Micro 800/44/0.5. Critically damped, never overshoot.
- Stagger: results 12ms · command list 15ms (initial only) · actions 10ms · extension grid 25ms.
- Window enter: opacity 0→1, scale 0.96→1, translateY -8→0, Window spring. Exit: fast 100ms ease-in (never spring).
- Tooltip: 50ms in, 0ms out. Empty state: 130ms ease-out in.
- Press: scale(0.95) Micro spring, buttons only. Loading: shimmer border 1000ms linear. No skeletons.
- prefers-reduced-motion: everything collapses to 0ms.

---

# REMAP → AI Clipboard extension theme (user directive: "color like the extension")
Extension tokens (clipboard-extension/tailwind.config.js + style.css):
- Dark: background #0F172A (slate-900), card #1E293B (slate-800), border #303B4E, muted-foreground #94A3B8, foreground slate-50
- Primary blue-600 #2563EB (buttons: hover indigo-600 #4F46E5), ring #3B82F6, secondary emerald #10B981, tertiary indigo #6366F1
- Font: Geist + Geist Mono (extension's voice — prefer over Inter for brand match)
- Radius: 8/12/16/24 + full (pill/selection overlay)

Mapping rules (keep Raycast STRUCTURE, extension COLOR):
- canvas #07080a → #020617 slate-950 (deepest) with #0F172A as surface step; build ladder: #020617 → #0F172A → #1E293B → #283548
- hairline #242728 → #303B4E; soft/hairline-strong stay as white alphas
- White CTA pill → extension primary blue-600 #2563EB, white text (hover #4F46E5) — this is the product's actual button color
- Accents-in-illustrations: blue #3B82F6, green #10B981, amber #F59E0B — only inside mockups/illustrations
- Hero stripe gradient: re-hue to blue family (#2563EB → #1E3A8A) OR omit — designer decides; keep once-per-page rule either way
- Text ladder: slate-50/slate-200/slate-400/slate-500 equivalents of ink/body/mute/ash
- Typography: Geist (extension brand font) at Raycast's scale/tracking; keycaps + mono = Geist Mono
