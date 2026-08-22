# Landing Rebuild — Execution Batch Plan (PM artifact)

Source of truth: `specs/landing-ui-spec.md` (fe1c9c8). Copy VERBATIM: `research/marketing-copy.md`.
Strategy: tear out white-Apple restyle, rebuild Product-First Stage. Every batch must leave `pnpm lint && pnpm build` green → incremental conventional commits. Engineer sessions truncate after 1-2 files → batches are 1-3 files max.

## Key decisions
- **Dep policy deviation (PM-verified)**: `@fontsource/cabinet-grotesk` does NOT exist on npm (404, confirmed all naming variants — Fontsource doesn't carry Fontshare/ITF fonts). Resolution: self-host. PM downloaded official Fontshare woff2 (400/700/800, ~20KB each) → `clipboard-web/public/fonts/cabinet-grotesk-{400,700,800}.woff2`. Engineer writes local `@font-face` in globals.css. NET RESULT: zero new npm deps — stricter than the original constraint. JetBrains Mono also not self-hosted; mono stack declared `"JetBrains Mono", Menlo, Monaco, Consolas, monospace` per spec line 60 (system fallback).
- **Green-commit bridge**: B1 keeps old token NAMES (`--canvas`, `--ink`, `--mute`, `--keycap-start`…) alive with NEW warm values so old components compile until teardown in B9. New tokens added alongside (`--font-display`, `--surface-subtle`, `--primary-surface`, success/error pairs).
- **Domain invariant (from PM audit)**: mobile selection is the production-breaking edge — `mouseup` alone is dead on iOS. Popover/canvas MUST use `selectionchange` + `mouseup` both, clamp popover rect into viewport, and preset chips are a first-class path (not a fallback) at <640px. QA must verify demo at 390×844 via chips.

## Batches (sequential, engineer dispatch each)
| # | Files | Spec ref | Commit |
|---|-------|----------|--------|
| B1 | dep install, `globals.css`, `tailwind.config.ts`, `layout.tsx` | §3 §4 | `feat(landing): warm-white foundation + Cabinet Grotesk display` |
| B2 | `demo/demo-content.ts`, `demo/use-demo-run.ts` | §5 | `feat(landing): demo state engine + canned content` |
| B3 | `demo/selection-popover.tsx` | §5 §6 | `feat(landing): selection-anchored popover, 5-state lifecycle` |
| B4 | `demo/article-canvas.tsx`, `hero.tsx` | §2 §5 | `feat(landing): interactive article canvas + product-first hero` |
| B5 | `header.tsx` | §2.1 §7 | `feat(landing): minimal navbar per IA` |
| B6 | `how-it-works.tsx`, `feature-rows.tsx` | §2.3 §2.4 | `feat(landing): typographic how-it-works + 60/40 feature rows` |
| B7 | `side-panel-demo.tsx` | §2.5 | `feat(landing): simulated streaming side-panel demo` |
| B8 | `privacy-strip.tsx`, `faq.tsx` | §2.6 §2.7 §6 | `feat(landing): privacy strip + hairline FAQ` |
| B9 | `final-cta.tsx`, `page.tsx`, delete hero-mockup/bento-grid/bento-card/demo/demo-stage/privacy | §2.8 | `feat(landing): final CTA + footer + composition teardown` |

Keep: `keycap.tsx` (auto-restyled by mono token), `ui/accordion.tsx`, `ui/button.tsx`, `lib/cn.ts`, `lib/constants.ts`.

## Verification per batch
`pnpm lint && pnpm build` in `clipboard-web/` → zero errors/warnings → commit. PM verifies files on disk before commit.

## Final gate
1. `pnpm lint && pnpm build` clean. 2. Serve :4321 (kill stale), curl 200. 3. co-founder anti-slop review at http://localhost:4321 (fallback: engineer skeptical-visitor screenshots 1440×900 + 390×844 → `qa/`).
