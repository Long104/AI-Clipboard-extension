# clipboard-v2 — 2 bug fixes + 3 features + Plasmo 0.90.5

Worktree: `.worktrees/clipboard-v2` · Branch: `feat/clipboard-v2` · All paths relative to `clipboard-extension/` unless noted.

## Section 1 — Product

### Goal & scope
Ship a production-quality increment of the AI Clipboard extension: fix the two confirmed UX-breaking bugs (invisible selection pill, sidepanel input bar covering messages), add copy-capture toast, real Alt+C shortcut, and a Settings (options) page with BYO API key + toggles, on Plasmo 0.90.5.

### Out of scope (NOT building)
- Backend changes of any kind (no auth/rate-limit enforcement server-side — see Open Question).
- Changes to `src/shared/messages.ts` message types (contracts frozen; copy-toast reuses `SELECTED_TEXT`).
- Chat/conversation features, new AI modes, popup redesign, Firefox target.
- Syncing settings across devices (local storage only).

### User stories / acceptance criteria
1. **Bug A (pill invisible):** When I select >5 chars on any page, the dark action pill (Explain / Summarize / Copy) appears styled (Tailwind) near the selection, because the overlay is a proper Plasmo CSUI with `getStyle` injecting the stylesheet. Unstyled/invisible pill = fail.
2. **Bug B (input bar covers messages):** In the Chrome side panel, the scroll container is exactly the visible panel height; the input bar is anchored at the bottom as a flex child; the last chat message is fully readable above the input bar without being covered. Root uses `h-full` (NOT `100vh`-based — vh in the sidepanel iframe reports the full window height, which is the root cause).
3. **Copy capture:** When I copy text (Ctrl/Cmd+C or context menu) on any page and "Capture on copy" is on, a toast appears top-right: brief red "Capturing…" (~600ms) → green "✓ Captured" with Explain / Summarize buttons + X close, auto-dismissing ~5s after the green state. Clicking Explain/Summarize runs the existing background AI flow (`SELECTED_TEXT`); the answer lands in sidepanel chat and on my clipboard. Selection pill keeps working independently.
4. **Alt+C:** Pressing Alt+C (Opt+C on Mac) opens/focuses the side panel. Command registered in manifest (`commands.toggle-sidepanel`, suggested_key Alt+C) and wired via `chrome.commands.onCommand` → `chrome.sidePanel.open`. Popup's existing "Alt+C" chip is now honest — no popup redesign.
5. **Settings page:** Right-click extension icon → Options (also a small gear button in popup footer) opens a Linear/Raycast-minimal settings page (Geist, slate palette, subtle borders — match existing sidepanel/popup tokens): BYO API key (password input + show/hide), usage mode (Free — 10 req/2h vs BYO key — unlimited), selection-pill on/off, capture-on-copy on/off. Settings persist in `chrome.storage.local` and take effect immediately (background + content scripts react without reload via `storage.onChanged`).
6. **Plasmo 0.90.5:** `plasmo` bumped 0.89.4 → 0.90.5; `pnpm build` and `pnpm test` pass.

### Open Question / flagged edge (report, do not fix)
**The backend performs zero authentication** (no `Authorization`/`X-Extension-Key` validation; `clipboard-backend/src/index.ts` has no auth middleware). Consequences: (a) `X-Extension-Key` sent by BYO mode is forward-compatible wiring only — the backend ignores it today; (b) the "free limit" is client-side advisory, bypassable via devtools. This is acceptable for this MVP increment (user-approved contract), but backend enforcement must land before any paid/scale story. Recorded as follow-up; NOT in this build.

## Section 2 — Engineering Handoff

### Context (verified facts)
- Plasmo 0.89.4 → 0.90.5: **no breaking changes** affecting CSUI, sidepanel, manifest, or React 18.2 (0.90.x added React 19 support, did not drop 18). Verify empirically via build after bump.
- `chrome.sidePanel.open` requires a user gesture — `chrome.commands.onCommand` counts as one (documented pattern). Requires `"sidePanel"` permission + Chrome 116+. Popup already calls it (with manual type cast) and works today; declaring the permission explicitly makes it deterministic in the generated manifest.
- `commands` is a manifest key, NOT a permission — no permissions entry needed.
- Tests: 27 (20 in `background.test.ts`, 7 in `contracts.test.ts`), vitest, chrome-global mock with `testState.storage` pattern — extend, don't restructure.
- Tailwind `content` already globs `src/contents/**` and `src/options/**` — no tailwind.config change needed.
- `style.css` = Geist @import + tailwind directives + base tokens; imported by sidepanel/popup directly; content scripts get it via `data-text:` in `getStyle`.
- Reuse: `Button` (`components/ui/button`), `Switch` (`components/ui/switch`, Radix), `cn` (`lib/utils`), `validateInput`/`isAiRequestResponse` (`shared/messages`), `enqueueWrite` (background), sidepanel storage-onChanged caching pattern.
- Env: `.env` provides `PLASMO_PUBLIC_BASE_URL` (+ optional `PLASMO_PUBLIC_API_KEY` → `Authorization: Bearer`). Keep env path intact.

### ADR — layout & settings ownership (summary, no new docs/adr file needed)
- **Sidepanel height:** `h-full` + `html,body{height:100%}` chosen over `h-screen` because the confirmed root cause is `100vh` resolving to the full window height inside the sidepanel iframe — any `*-screen` class reintroduces the bug.
- **Settings storage:** single `settings` object key in `chrome.storage.local`, owned (written) by the options page; background/content scripts are read-only consumers + `onChanged` cache. Keeps background's single-writer rule for `chatRoom`/`limit` untouched and avoids key-spray.
- **BYO key transport:** sent as `X-Extension-Key` header (user-approved contract; backend enforcement is future work — see Open Question). Env Bearer behavior unchanged for free mode.

### 1. Target files
| File | Action |
|---|---|
| `package.json` | modify — plasmo 0.90.5; manifest: add `"sidePanel"` permission + `commands` block |
| `src/style.css` | modify — add `html, body { height: 100%; }` in base layer |
| `src/contents/floating-overlay.tsx` | modify — Bug A CSUI conversion + overlayEnabled gate |
| `src/contents/copy-toast.tsx` | create — Feature 1 toast CSUI |
| `src/sidepanel/index.tsx` | modify — Bug B layout (3 class edits) |
| `src/background.ts` | modify — settings read + BYO unlimited + `X-Extension-Key` + onCommand wiring |
| `src/shared/settings.ts` | create — settings types, defaults, parse/load/save |
| `src/shared/capture.ts` | create — pure copy-capture decision helpers |
| `src/options/index.tsx` | create — Feature 3 options page |
| `src/popup/index.tsx` | modify — add gear button (openOptionsPage) in footer |
| `src/__tests__/settings.test.ts` | create |
| `src/__tests__/capture.test.ts` | create |
| `src/__tests__/background.test.ts` | modify — new cases (BYO, header, command) |
| `pnpm-lock.yaml` | regenerate via installer |

File-size note: `background.ts` is 303 lines pre-change; target ≤350 after (new logic lives in `shared/`). Do NOT split the file — test imports depend on the single module.

### 2. Plasmo bump (do FIRST, isolate breakage)
1. `pnpm i plasmo@0.90.5` (workdir `clipboard-extension/`).
2. `pnpm build && pnpm test` — both must pass before any other edit. If 0.90.5 breaks something, STOP and report (do not hack around framework breaks).

### 3. Bug B — sidepanel layout (`src/sidepanel/index.tsx`, `src/style.css`)
1. `style.css`, inside existing `@layer base` (after the `body` rule): add
   ```css
   html, body { height: 100%; }
   ```
   (Extension pages only import this file; inside content-script shadow DOM the `body` selector matches nothing — safe.)
2. Line 265 loading state: `min-h-screen` → `h-full`.
3. Line 273 root: `min-h-screen flex flex-col flex-1 relative …` → `h-full flex flex-col relative …` (drop `flex-1`, keep bg/text/font classes verbatim).
4. Line 274 scroll area: `pb-20` → `pb-4` (keep `flex-1 overflow-y-auto overflow-x-hidden px-4 pt-4`).
5. Line 315 input bar: remove `absolute bottom-0` → add `shrink-0`; keep `w-full flex flex-col p-3 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm border-t …` verbatim otherwise.
Result: column flex — scroll area flexes, input bar pinned as last flex child. No absolute positioning remains.

### 4. Bug A + overlay gate — `src/contents/floating-overlay.tsx`
1. Delete lines 100–103 (manual root + `createRoot`) and the `createRoot` import.
2. Convert `function FloatingActionPill()` → `export default function FloatingActionPill()` (Plasmo CSUI renders it into a managed shadow-DOM host).
3. Add stylesheet injection:
   ```ts
   import styleText from "data-text:@/style.css"
   export const getStyle = () => {
     const style = document.createElement("style")
     style.textContent = styleText
     return style
   }
   ```
4. Keep `export const config: PlasmoCSConfig = { matches: ["<all_urls>"], all_frames: true }` unchanged. Keep existing fixed-position pill markup (inline `top/left`, `z-[99999]`, `fixed` works from inside the Plasmo host).
5. Add `overlayEnabled` gate: on mount, read `settings` via `loadSettings()`; subscribe to `chrome.storage.onChanged` (same pattern as sidepanel `setupStorageListeners`, with cleanup) to cache `overlayEnabled` in state. In `handleSelection`, if `!overlayEnabled` → `setVisible(false); return` before measuring.
6. If TypeScript lacks the `data-text:` module declaration, add `clipboard-extension/types.d.ts` with `declare module "data-text:*" { const content: string; export default content }` (check first — plasmo usually ships it).

### 5. Feature 1 — copy-capture toast
**`src/shared/capture.ts`** (pure, no chrome imports):
```ts
export const CAPTURE_MIN_LENGTH = 5
export const TOAST_CAPTURING_MS = 600
export const TOAST_AUTO_DISMISS_MS = 5000
/** Decide whether a copy event should surface the capture toast. */
export function shouldCaptureCopy(text: unknown, captureOnCopy: boolean): boolean
```
Implementation: `captureOnCopy === true` AND `typeof text === "string"` AND `text.trim().length > CAPTURE_MIN_LENGTH`. (Reuse `validateInput` from `shared/messages` internally — return `validateInput(text) !== null && validateInput(text)!.length > CAPTURE_MIN_LENGTH`, or equivalent single-pass logic.)

**`src/contents/copy-toast.tsx`** — proper CSUI from day one (`config` same as overlay; `getStyle` same data-text pattern):
- State machine: `idle → capturing (red, TOAST_CAPTURING_MS) → captured (green, buttons) → (TOAST_AUTO_DISMISS_MS after entering captured) → idle`; `X` button and Explain/Summarize click → `idle` immediately. Store captured text in state.
- Listener: `document.addEventListener("copy", handler)` in `useEffect` with cleanup. Handler: `const text = window.getSelection()?.toString()` → if `shouldCaptureCopy(text, captureOnCopyRef.current)` → set text + enter `capturing`. (`copy` event's `clipboardData` is write-only — read the selection instead. Event fires once, in the frame holding the selection.)
- Settings cache: same load + `onChanged` subscription as overlay (`captureOnCopy` field).
- Toast UI (Linear/Raycast minimal): top-right `fixed top-4 right-4 z-[99999]`, card `rounded-xl border shadow-lg bg-white dark:bg-slate-900 px-3.5 py-3` + accent bar or icon color per state: capturing → `text-red-500`/red dot + label "Capturing…"; captured → `Check` icon `text-emerald-500` + "Captured". Buttons `Explain` (Sparkles icon) / `Summarize` (FileText icon) — ghost style, `text-xs font-medium`, hover `bg-slate-100 dark:bg-slate-800`. `X` icon button with `aria-label="Dismiss"`. Root: `role="status"` `aria-live="polite"`. Subtle `animate-in fade-in slide-in-from-top-1 duration-150` (tailwindcss-animate is installed).
- Action: `chrome.runtime.sendMessage({ type: "SELECTED_TEXT", text } as ExtensionRequest, cb)`; in cb, if `isAiRequestResponse(response) && "modifiedText" in response && response.modifiedText` → `navigator.clipboard.writeText(response.modifiedText).catch(console.error)` (parity with overlay). Errors: dismiss silently — badge + sidepanel already surface outcomes. Guard `chrome.runtime.lastError` in cb (no-op).
- Timers: `window.setTimeout`, cleared on unmount, state change, and manual dismiss.

### 6. Feature 2 — Alt+C (`package.json`, `src/background.ts`)
1. `package.json` → `"manifest"`:
   - `"permissions": ["clipboardWrite", "storage", "tabs", "alarms", "sidePanel"]`
   - add:
     ```json
     "commands": {
       "toggle-sidepanel": {
         "suggested_key": { "default": "Alt+C", "mac": "Alt+C" },
         "description": "Open the AI Clipboard side panel"
       }
     }
     ```
   (Chrome command syntax uses `Alt+C` on mac = ⌥C.)
2. `background.ts` — export a testable handler:
   ```ts
   export async function handleCommand(
     command: string,
     openPanel: (windowId: number) => Promise<void> | void
   ): Promise<void>
   ```
   Behavior: if `command === "toggle-sidepanel"` → `const win = await chrome.windows.getLastFocused(); if (win?.id != null) await openPanel(win.id)`. Else no-op.
3. Register (guarded like other listeners):
   ```ts
   if (typeof chrome !== "undefined" && chrome.commands?.onCommand) {
     chrome.commands.onCommand.addListener((command) => {
       handleCommand(command, (windowId) =>
         (chrome as any).sidePanel?.open?.({ windowId })
       )
     })
   }
   ```
   If `@types/chrome` 0.0.258 already types `sidePanel`/`windows`, drop the casts and use the typed API (`chrome.sidePanel.open({ windowId })`). `windows` needs no permission for `getLastFocused`.
4. Popup: no functional change (chip already present). Conflicts with other extensions' Alt+C resolve via `chrome://extensions/shortcuts` — note only.

### 7. Feature 3 — settings (shared, background, options page, popup)
**`src/shared/settings.ts`**:
```ts
export type UsageMode = "free" | "byo"
export interface ExtensionSettings {
  apiKey: string        // "" when unused
  usageMode: UsageMode
  overlayEnabled: boolean
  captureOnCopy: boolean
}
export const DEFAULT_SETTINGS: ExtensionSettings = { apiKey: "", usageMode: "free", overlayEnabled: true, captureOnCopy: true }
/** Field-wise defensive merge; invalid/unknown values fall back to defaults. Never throws. */
export function parseSettings(value: unknown): ExtensionSettings
export async function loadSettings(): Promise<ExtensionSettings>   // chrome.storage.local.get("settings") → parseSettings
export async function saveSettings(s: ExtensionSettings): Promise<void>  // chrome.storage.local.set({ settings: s })
export function isByoActive(s: ExtensionSettings): boolean  // s.usageMode === "byo" && s.apiKey.trim().length > 0
```
`parseSettings`: object guard → per-field: `apiKey` string (else ""), `usageMode` `"free"|"byo"` (else "free"), booleans (else defaults). `loadSettings` wrapped in try/catch → `DEFAULT_SETTINGS` on failure (content scripts must never hard-fail on storage errors).

**`src/background.ts`**:
1. `fetchTranslate(messageText: string, byoKey?: string)`: after existing header setup — `if (byoKey) headers["X-Extension-Key"] = byoKey;` (env Bearer branch untouched; BYO key takes precedence when provided). No logging of key values anywhere.
2. `processAiRequest`: extend the storage `get` inside `enqueueWrite` to also fetch `"settings"`; `const settings = parseSettings(storageData.settings)`; `const byo = isByoActive(settings)`.
   - Limit check: `if (!byo && limit >= MAX_USAGE_LIMIT) { …LIMIT_REACHED… }` (badge "!" path unchanged).
   - Call: `fetchTranslate(text, byo ? settings.apiKey.trim() : undefined)`.
   - Increment: `const updatedLimit = byo ? limit : limit + 1;` — BYO does not consume/increment free quota. `chatRoom` append unchanged (answer still lands in sidepanel). Badges unchanged.
3. Existing 27 tests must stay green — `fetchTranslate` gains an optional param only; `processAiRequest` behavior for default (no `settings` key) storage is identical to today (`parseSettings(undefined)` → defaults → `byo=false`).

**`src/options/index.tsx`** (default export; Plasmo auto-registers options page; imports `@/style.css`):
- Load `loadSettings()` on mount (loading spinner state like popup), cache in state, write-through on every change (`saveSettings`) with transient "Saved ✓" indicator (clear after 1.5s). Text input debounced 500ms before save.
- Layout (max-w-md mx-auto p-6, `font-sans`, bg-white dark:bg-slate-950): header — `Sparkles` icon + "AI Clipboard" title + `text-xs text-slate-400` version (from `package.json` via `process.env.PLASMO_PUBLIC_??` — hardcode "Settings" subtitle instead; do NOT add env plumbing).
- Section "AI Provider" (`text-xs font-medium uppercase tracking-wider text-slate-400` section labels, `space-y-4` cards `rounded-xl border border-slate-200 dark:border-slate-800 p-4`):
  - Usage mode segmented control (2 buttons in a `rounded-lg bg-slate-100 dark:bg-slate-800 p-1` container; active = `bg-white dark:bg-slate-900 shadow-sm`): "Free — 10 requests / 2 h" | "Bring your own key".
  - API key row: `type="password"` input (`rounded-lg border … text-sm p-2.5 bg-slate-50 dark:bg-slate-900`, placeholder `sk-…`), eye/eye-off toggle button (`aria-label="Show API key"`), helper text `text-xs text-slate-400`: "Stored only in this browser. Sent to the AI backend as X-Extension-Key." Disabled + `opacity-50` when mode = free.
- Section "Overlays": two `Switch` rows (reuse `@/components/ui/switch`): "Selection pill" — helper "Show the action pill when you select text" (binds `overlayEnabled`); "Capture on copy" — helper "Show a toast when you copy text" (binds `captureOnCopy`). Row: `flex items-center justify-between`.
- Edge states: storage read failure → inline error card + "Retry" button (re-run load). Empty key + BYO selected → allow saving (background falls back to free behavior via `isByoActive`) but show subtle amber hint "Add a key to activate BYO mode".

**`src/popup/index.tsx`**: in the footer row (next to the Alt+C chip) add a ghost icon button (`Settings`/`Gear` lucide icon, `size={12}`, `aria-label="Open settings"`, `variant="ghost" size="sm"` classes matching footer) → `chrome.runtime.openOptionsPage()`. No other popup changes.

### 8. Test matrix (executable contracts)
**`src/__tests__/settings.test.ts`** (new, ~10 cases):
- `parseSettings(undefined|null|number|string)` → `DEFAULT_SETTINGS` value per field.
- `parseSettings({})` → all defaults.
- Partial merge: `{ overlayEnabled: false }` → others default, overlayEnabled false.
- Type guards: `{ apiKey: 123 }` → `""`; `{ usageMode: "xyz" }` → `"free"`; `{ captureOnCopy: "yes" }` → `true` (default).
- Valid full object → round-trip identity.
- `isByoActive`: byo+key → true; byo+empty/whitespace key → false; free+key → false.

**`src/__tests__/capture.test.ts`** (new, ~8 cases):
- `shouldCaptureCopy("hello world", true)` → true; `("hello", true)` (≤5) → false; `("   ", true)` → false; `(123 as any, true)` → false; `("hello world", false)` → false; `("", true)` → false; boundary: 6-char trimmed string → true.

**`src/__tests__/background.test.ts`** (extend existing chrome mock — add `windows: { getLastFocused: vi.fn() }`, `commands: { onCommand: { addListener: vi.fn() } }` only if needed; keep all 20 existing tests untouched):
- BYO unlimited: seed `settings = { usageMode: "byo", apiKey: "sk-test", … }`, `limit = 10` (MAX) → mock fetch 200 → `processAiRequest` resolves `{ modifiedText }`; `testState.storage.limit` still `10`; `chatRoom` has 2 new entries.
- BYO blank key falls back: `settings = { usageMode: "byo", apiKey: "  " }`, `limit = 10` → `{ error: "LIMIT_REACHED" }`.
- `fetchTranslate("x", "sk-test")` with mocked global `fetch` → request `init.headers["X-Extension-Key"] === "sk-test"`.
- `fetchTranslate("x")` (no key) → header absent; env-Bearer branch unchanged (existing tests cover).
- `handleCommand("toggle-sidepanel", opener)` with `chrome.windows.getLastFocused` mocked to `{ id: 7 }` → `opener` called with `7`.
- `handleCommand("other", opener)` → `opener` not called.
- Free mode at limit still `LIMIT_REACHED` (may already exist — keep green).

### 9. Verification Exit Criteria (Engineer self-checks, all binary)
- [ ] `pnpm test` (workdir `clipboard-extension/`) → exit 0, ≥27 + all new tests pass (report exact count).
- [ ] `pnpm build` → exit 0.
- [ ] `grep -q '"sidePanel"' build/chrome-mv3-prod/manifest.json` → found.
- [ ] Built manifest contains `"commands"` with `"toggle-sidepanel"` and `"Alt+C"`; contains options page (`"options_page"` or `"options_ui"`).
- [ ] `grep -n "createRoot" src/contents/floating-overlay.tsx` → no matches (manual mount removed).
- [ ] `grep -n "min-h-screen\|h-screen\|absolute bottom-0" src/sidepanel/index.tsx` → no matches; `h-full` present on root.
- [ ] `grep -n "X-Extension-Key" src/background.ts` → present; `grep -rn "apiKey" src/background.ts` shows no `console.log` of key values.
- [ ] `npx tsc --noEmit` → exit 0.
- [ ] `ls build/chrome-mv3-prod/` shows options page artifact (e.g. `options.html`) and both content scripts in manifest `content_scripts`.
- [ ] `git status` — no unintended files (no `.env`, no `build/` committed; confirm `.gitignore` covers `build`).

### 10. Edge matrix
| Edge | Expected |
|---|---|
| Copy of ≤5 chars / whitespace / non-string | No toast (`shouldCaptureCopy` false) |
| Copy while previous toast open | Reset state machine to `capturing` with new text (timers cleared) |
| Copy on page with no settings written | Defaults: toast shows (captureOnCopy default true), pill shows |
| Storage read throws in content script | `loadSettings` catch → defaults; UI still functional |
| BYO mode + blank key | Falls back to free limit path (`isByoActive` false) |
| BYO mode at free limit 10 | Request proceeds, limit stays 10, no increment |
| Settings key contains garbage | `parseSettings` per-field defaults, never throws |
| Sidepanel empty chat | Input bar bottom-anchored; empty state visible above it |
| Alt+C when sidepanel already open | `sidePanel.open` re-focuses (idempotent) |
| `onCommand` in environment without `chrome.commands` | Guarded no-op (test env) |
| 10k-char copy | Flows through existing `clampInput` (24k) — toast shows text is captured; truncation handled by background |
| Component unmount mid-timer | All timers cleared (no setState-after-unmount) |

### Vertical slice order
1. Plasmo bump + build/test gate → 2. Bug B layout (+ style.css) → 3. Bug A CSUI conversion → 4. shared/settings.ts + shared/capture.ts + tests → 5. background wiring (BYO + command) + tests → 6. copy-toast CSUI → 7. options page + popup gear → 8. full verification sweep.
