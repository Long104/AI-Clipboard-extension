# UX Polish — Production-Level Pass Before Chrome Web Store Submission

Branch: `feat/ux-polish` | Worktree: `.worktrees/ux-polish` | Source: live QA audit verdict "needs-polish (4 issues)"

---

## Section 1 — Product

### Goal & Scope
Close all 5 QA audit findings so the extension ships CWS-production-level UX:
1. **Loading feedback** — sidepanel shows a spinner + disabled send during AI fetch; toolbar badge shows activity during copy→AI flow.
2. **Sidepanel styling** — "reset" → "Reset"; prototype `bg-gray-400` page → clean neutral background; thick `border-2 gray-800` bubbles → refined; chat auto-scrolls to newest message.
3. **Copy flow feedback** — `chrome.action` badge: "AI" while processing, "✓" green on success, "!" red on error, auto-clears ~2s. Non-intrusive (no overlay).
4. **Popup polish** — "Clipboard History" button de-absolutized into flex-column layout with gap; no overlap at any popup scale.
5. **Textarea UX** — placeholder "ask ai" → "Ask AI…"; Enter-to-send preserved.

### Out of Scope (NOT building)
- No overlay content script re-introduction (explicitly forbidden).
- No new dependencies (no @tabler/icons-react, no test-render libs for React).
- No backend changes, no manifest permission changes (badge needs no permission).
- No redesign of options page, no theming system, no i18n.
- No chat streaming/SSE, no message editing/deletion.

### User Stories / Acceptance Criteria
- **US1**: As a sidepanel user, when I press Enter/Send, I immediately see a loading state (spinner on button, input disabled) until the bot reply lands — never a frozen-feeling UI.
- **US2**: As a sidepanel user, when a new message arrives (mine or bot's), the chat view scrolls to show it without me dragging.
- **US3**: As a copy-flow user, when I copy text, the toolbar icon shows "AI" during processing, then "✓" (green) or "!" (red), then clears within ~2s — I always know what happened.
- **US4**: As a popup user, the toggle and "Clipboard History" button stack vertically with even spacing at any zoom/popup size — nothing overlaps.
- **US5**: As any user, text is human-polished: "Reset", "Ask AI…", no debug console noise in popup.
- **AC gate**: `pnpm --prefix clipboard-extension build` exit 0; full vitest suite green (existing 5 + new badge tests); no new deps in package.json.

### Domain Gap (flagged, not silently fixed)
**MV3 timer reliability for badge clear**: a naive `setTimeout` for the 2s clear is *usually* safe (SW stays alive ≥30s after last event) but `chrome.alarms` is *worse* here — packed extensions enforce a ~30s minimum alarm granularity, so an "alarm at 2s" fires at ~30s leaving a stale badge. Decision (documented in Engineering Handoff §ADR-1): plain `setTimeout` + module-level timer handle + self-healing overwrite (every new request resets badge state first). Residual risk of a stuck badge if the SW is killed inside the 2s window is accepted; it self-heals on next request.

---

## Section 2 — Engineering Handoff

### Context (from Discover, verified by direct file read)
- Stack: Plasmo 0.89.4, React 18.2.0, TypeScript 5.3.3 (strict), Mantine `@mantine/core@^7.15.2`, Tailwind 3.4.17 (Plasmo-builtin, no tailwind.config), Vitest 2.1.9, pnpm.
- Architecture invariants (MUST preserve):
  - **Single writer**: `background.ts` is the ONLY writer to `chrome.storage.local` (via `enqueueWrite`). NOTE: `popup/index.tsx:19` currently violates this (direct `chrome.storage.local.set({isOn})`) — fix in Step 4 (message-only, background already writes `isOn` on `TOGGLE_SWITCH`).
  - Content script `site-one.ts` is messaging-only — **do not touch it** (badge lives in background).
  - No overlay in build — **do not re-add**.
  - AGENTS.md: strict typing, no `any` (popup line 28 `(chrome as any)` gets typed), TDD (badge tests written with/around implementation).

### ADR-1 — Badge clearing strategy (in-spec decision, not filed)
`clearBadgeAfter(ms)` uses `setTimeout` stored in a module-level `badgeClearTimer` (clear previous before setting new). NOT `chrome.alarms` (30s min granularity defeats 2s UX). Every `processAiRequest` entry overwrites badge first → stale states self-heal. Badge APIs guarded with `chrome.action?.` existence checks (pattern-consistent with existing `chrome.alarms` guards, keeps vitest mock surface explicit).

### Target Files (4, all ≤300 lines post-edit)
| File | Change |
|---|---|
| `clipboard-extension/src/background.ts` | badge feedback in `processAiRequest` |
| `clipboard-extension/src/sidepanel/index.tsx` | pending state + send button + autoscroll + styling + placeholder |
| `clipboard-extension/src/popup/index.tsx` | flex layout + single-writer fix + typed sidePanel cast + console.log removal |
| `clipboard-extension/src/__tests__/background.test.ts` | chrome.action mock + 5 new badge tests |

### Step 1 — background.ts: badge feedback

Add after the `MAX_USAGE_LIMIT` export (line ~14):

```ts
const BADGE_CLEAR_MS = 2000;
let badgeClearTimer: ReturnType<typeof setTimeout> | undefined;

function setBadge(text: string, color: string): void {
	if (typeof chrome !== "undefined" && chrome.action?.setBadgeText) {
		chrome.action.setBadgeText({ text });
		chrome.action.setBadgeBackgroundColor({ color });
	}
}

function clearBadgeAfter(ms: number): void {
	if (badgeClearTimer) clearTimeout(badgeClearTimer);
	badgeClearTimer = setTimeout(() => setBadge("", "#000000"), ms);
}
```

Badge semantics inside `processAiRequest` (exact placement):
- **INVALID_INPUT** (blank text, line ~76): return early, **no badge** (nothing happened; sidepanel already validates blank locally).
- **DISABLED** (line ~88): **no badge** — user opted out; silent by design.
- **LIMIT_REACHED** (line ~92): `setBadge("!", "#e03131"); clearBadgeAfter(BADGE_CLEAR_MS);` before return.
- **Processing start** — immediately before `fetchTranslate(text)` (line ~96): `setBadge("AI", "#5c5f66");` (neutral gray).
- **API_ERROR** (line ~97): `setBadge("!", "#e03131"); clearBadgeAfter(BADGE_CLEAR_MS);` before return.
- **Success** — after the storage write resolves, before `return { modifiedText }` (line ~123): `setBadge("✓", "#2f9e44"); clearBadgeAfter(BADGE_CLEAR_MS);`.

Colors are hex strings (Mantine v7 palette-adjacent: red #e03131, green #2f9e44, gray #5c5f66). "AI"/"✓"/"!" all fit badge's 4-char cell.

### Step 2 — sidepanel/index.tsx: loading, autoscroll, styling, placeholder

**2a. Pending state** (distinct from initial-load `loading`):
- Add `const [pending, setPending] = useState(false);`
- `sendChat()`: guard `if (pending) return;` at top; `setPending(true)` after the blank/limit guards; in the `sendMessage` callback: `setPending(false)` then existing error handling.
- Wrap callback body defensively: `chrome.runtime.sendMessage(..., (response) => { setPending(false); if (chrome.runtime.lastError) { setError("Unable to reach background service."); return; } ... })` — `runtime.lastError` check prevents unchecked-error noise if SW restarts mid-flight.

**2b. Send button + input row** (replaces bare textarea, lines 200–211):
```tsx
<div className="flex w-full items-end gap-2">
	<textarea
		placeholder="Ask AI…"
		rows={2}
		disabled={pending}
		className="text-sm w-full min-h-[50px] border border-gray-300 rounded-xl pl-4 pt-2 resize-none bg-white placeholder:text-gray-400 disabled:opacity-60"
		onChange={(e) => setChat(e.target.value)}
		value={chat}
		onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
	/>
	<Button size="sm" radius="md" loading={pending} disabled={!chat.trim() || isLimitReached} onClick={sendChat}>Send</Button>
</div>
```
- Enter-to-send preserved (Shift+Enter may newline — free improvement, note in worklog).
- Mantine `Button` `loading` prop renders built-in spinner → satisfies "spinner" requirement with zero new deps.

**2c. Auto-scroll**:
- `import { useRef } from "react"` (extend existing React import).
- `const messagesEndRef = useRef<HTMLDivElement>(null);`
- Render `<div ref={messagesEndRef} />` as last child inside the message-list column (after the `chatRoom.map`).
- `useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [chatRoom]);`

**2d. Layout & styling refactor** (lines 148–173):
- Outer div: `min-h-screen min-w-screen flex flex-col flex-1 relative bg-gray-100 overscroll-y-none` (bg-gray-400 → bg-gray-100; matches loading screen).
- Message column: `flex flex-col flex-1 overflow-y-auto min-h-0 px-2 pb-2` — creates the scroll container the audit implied was missing.
- Chat bubbles (line 168): remove `border-2 gap-y-60 border-gray-800`; user bubble: `max-w-[75%] break-words p-2.5 bg-blue-600 text-white rounded-2xl rounded-br-md`; bot bubble: `max-w-[75%] break-words p-2.5 bg-white border border-gray-200 text-gray-900 rounded-2xl rounded-bl-md`. Conditional on `msg.sender === "bot" ? ... : ...` in the existing template.
- Error banner (line 151): add `mt-3` (top margin now that messages scroll).
- Empty state (line 157): unchanged text, add `pt-6`.

**2e. Reset button** (lines 178–186): label `reset` → `Reset`; props → `variant="subtle" color="gray" size="xs" radius="md"`; add `aria-label="Reset chat history"`; remove wrapper `<div className="max-w-16">` (unneeded constraint).

**2f. Usage row**: keep `Usage: {isLimit}/10` and limit-reached notice as-is (semantics unchanged).

### Step 3 — sidepanel styling constants
None. Tailwind classes only; no new CSS files. `style.css`/`button.css` untouched.

### Step 4 — popup/index.tsx: layout + invariants

- **Layout** (lines 49–60): parent → `<div className="min-w-64 min-h-64 flex flex-col items-center justify-center gap-6 p-4">`; Button: delete `className="z-50 absolute bottom-5"` entirely (keep `variant="light" radius="xl" color="cyan"`), add `size="md"` and `aria-label="Open clipboard history sidepanel"`.
- **Single-writer fix** (lines 19–22): delete `chrome.storage.local.set({ isOn: newState }, ...)` — keep optimistic `setIsOn(newState)` + `chrome.runtime.sendMessage({ type: "TOGGLE_SWITCH", isOn: newState })`. Background's `TOGGLE_SWITCH` handler already persists via `enqueueWrite` (background.ts:129–138). Remove the `console.log`.
- **Typing fix** (line 28): `(chrome as any).sidePanel.open(...)` → typed narrow cast:
```ts
const sidePanelApi = (chrome as unknown as { sidePanel?: { open: (opts: { windowId?: number }) => Promise<void> | void } }).sidePanel;
sidePanelApi?.open({ windowId: window.id });
```
- Remove unused `isExtensionOn` state (line 9) — dead code, `any`-adjacent lint risk.

### Step 5 — Tests: `clipboard-extension/src/__tests__/background.test.ts` — ✅ DONE (TDD red phase complete, 5 badge tests written and verified failing-appropriate; implementation remains)

**Timing resolution (authoritative)**: `setBadge("AI")` fires inside `enqueueWrite`'s callback → a microtask. Therefore the "AI" assertion MUST come AFTER `await promise` (this matches the original spec sketch: `await processAiRequest("hello")`; assert `["AI", "✓", ""]` in order). The test's current placement of `toHaveBeenNthCalledWith(1, { text: "AI" })` BEFORE `await promise` is a test bug — move that single assertion to after `await promise;` (keep all other assertions unchanged). Implementation stays as speced: badge after isOn/limit checks, before `fetchTranslate`.

**Mock surface**: extend the existing `chrome` global mock with:
```ts
chrome.action = {
	setBadgeText: vi.fn(),
	setBadgeBackgroundColor: vi.fn(),
};
```
(match existing mock style in the file; ensure `vi.mocked(chrome.action.setBadgeText).mockClear()` per-test via existing beforeEach pattern or per-test reset).

**New tests (TDD: write first, watch fail, implement Step 1):**
1. `badge shows AI then ✓ and clears on success` — mock storage (isOn=true, limit=0), mock fetch success; `await processAiRequest("hello")`; assert `setBadgeText` calls `["AI", "✓", ""]` in order (`toHaveBeenNthCalledWith`), `setBadgeBackgroundColor` last call `{ color: "#2f9e44" }`; use `vi.useFakeTimers()` + `vi.advanceTimersByTime(2000)` for the clear (restore real timers in afterEach).
2. `badge shows ! and clears on API error` — mock fetch reject/non-ok; assert calls `["AI", "!"]` then after 2000ms `""`; last bg color `#e03131`.
3. `badge shows ! on limit reached without fetching` — limit=10; assert `["!", ""]` and `fetch` NOT called.
4. `no badge on blank input` — `processAiRequest("   ")`; assert `setBadgeText` never called.
5. `no badge when extension disabled` — isOn=false; assert `setBadgeText` never called and fetch not called.

Existing 5 tests must remain green (badge mock must not break the `enqueueWrite`/alarm tests — they don't assert chrome.action, so additive mock is safe).

### Component States (sidepanel)
| State | Render |
|---|---|
| Initial load | existing `Loading chat history...` screen (unchanged) |
| Empty chat | "Copy text or ask a question" hint (unchanged) |
| Pending (AI in flight) | Send button spinner, textarea disabled, input cleared optimistically |
| Error | red banner above messages (existing `getErrorMessage` mapping, + lastError fallback) |
| Limit reached | inline red notice + Send disabled (existing isLimit logic) |
| Long history | scrollable message column, auto-scroll on append |

### Edge Matrix
| Edge | Expected |
|---|---|
| Blank/whitespace chat input | sendChat early-return; Send disabled via `!chat.trim()` |
| Enter pressed while pending | guarded (`if (pending) return`) |
| SW restarted mid-flight | `chrome.runtime.lastError` handled → pending=false + error banner (no hang) |
| Rapid successive copies | badge self-heals: each request overwrites; `clearTimeout` prevents stacked clears |
| SW killed inside 2s badge window | stale badge until next request — accepted (ADR-1) |
| 10k-char message | `break-words max-w-[75%]` wraps; autoscroll fires once per chatRoom change |
| Popup at 150% zoom | flex column + gap keeps toggle/button stacked, no overlap |
| isOn=false copy | silent (no badge, no fetch) — opt-out respected |

### Verification Exit Criteria (Engineer MUST self-verify all before DONE)
- [ ] `pnpm --prefix clipboard-extension build` exits 0 — run in worktree root
- [ ] `pnpm --prefix clipboard-extension test` exits 0, ≥10 tests pass (5 existing + 5 new badge) — vitest summary in output
- [ ] `pnpm --prefix clipboard-extension exec tsc --noEmit` exits 0 (strict; no `any` introduced)
- [ ] `grep -c 'placeholder="Ask AI…"' clipboard-extension/src/sidepanel/index.tsx` → 1
- [ ] `grep -rn "absolute bottom-5" clipboard-extension/src/popup/index.tsx` → no matches
- [ ] `grep -n ">reset<" clipboard-extension/src/sidepanel/index.tsx` → no matches; `>Reset<` present
- [ ] `grep -c "chrome.storage.local.set" clipboard-extension/src/popup/index.tsx` → 0 (single-writer restored)
- [ ] `git diff clipboard-extension/package.json` → empty (no new deps)
- [ ] `grep -c "setBadgeText" clipboard-extension/src/background.ts` → ≥4 (AI/✓/!/clear paths)
- [ ] `grep -c "(chrome as any)" clipboard-extension/src/popup/index.tsx` → 0
- [ ] Existing tests untouched semantically: only additive mock + new describe block in test file

### Build/Test/Log Commands
- Build: `pnpm --prefix clipboard-extension build` ( Plasmo → `build/chrome-mv3/`)
- Test: `pnpm --prefix clipboard-extension test` (vitest run)
- Typecheck: `pnpm --prefix clipboard-extension exec tsc --noEmit`
- Logs: vitest stdout; plasmo build stderr on failure
