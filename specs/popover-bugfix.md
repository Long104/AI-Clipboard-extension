# Popover Bugfix — 4 regressions in result-popover pipeline

Branch: `feat/popover-bugfix` (worktree `.worktrees/popover-bugfix`)
Baseline: 67/67 vitest green @ 67deaee. Discovered root causes verified by static analysis (high confidence, file:line evidence below).

---

## Section 1 — Product

### Goal
Fix 4 shipped bugs in the AI Clipboard extension's result-popover feature so the inline "Look Up" card actually works end-to-end:

1. **Popover card renders blank** — card frame (header/buttons/spinner) shows but AI result text never appears, for BOTH pill-triggered and copy-toast-triggered actions. The answer lands only in the sidepanel chat.
2. **Selection pill unreliable** — highlighting text often shows NO pill (Ctrl+C toast still works).
3. **Pill position wrong** — when shown, pill appears far below the selection (e.g. ~600px, near viewport bottom) instead of adjacent to the highlighted text.
4. **Wheel-scroll dead over chat cards** — sidepanel chat scrolls generally, but wheel over a message card / code block does nothing.

### Out of scope (explicitly NOT building)
- Pill following page scroll after placement (pre-existing fixed-position behavior; result card already dismisses on scroll).
- Changing the min-selection threshold product value (stays `> 5` chars, same as copy-capture).
- Any background.ts / message-contract changes — background already writes `popoverRequest` + `popoverResult` correctly; the bugs are all consumer-side.
- New dependencies. No jsdom — new tests must target pure functions (vitest runs in Node env).
- Visual redesign. Design system stays: Linear/Raycast, Geist, slate palette, `components/ui`.

### Acceptance criteria
- AC1: Triggering Explain/Summarize from the pill OR the copy-toast renders the AI text inside the popover card (status done), or an error card with Retry on failure — even when the storage result event arrives in the same onChanged batch as the request, or before the component was listening.
- AC2: Pill appears for: mouse drag-select, double-click word select, keyboard selection (Shift+arrows / Cmd+A), and selection inside `<input>`/`<textarea>` — whenever trimmed text length > 5.
- AC3: Pill renders just below the selection's bounding box in viewport coordinates; flips above when no room below; horizontally clamped to viewport margins. Anchor passed to `triggerAiAction` stays viewport-based.
- AC4: Wheel over message cards and code blocks scrolls the sidepanel chat (scroll chaining restored); chat container contains overscroll at its own boundary.

### Domain invariant (edge the user did NOT mention)
`POPOVER_RESULT_KEY` **persists in storage after an action completes**. When a NEW request is created, hydration/same-batch logic MUST NOT render the PREVIOUS request's result into the new card. This breaks in production as "wrong answer shown" if result reads skip requestId matching. Hard rule: every result application matches `requestId` AND `tabId` AND `frameId` AND `status === "loading"`.

---

## Section 2 — Engineering Handoff

### ADR & scaling tradeoffs
- **Chosen**: keep the storage-event bus (`popoverRequest`/`popoverResult` via `chrome.storage.local`); fix the lossy consumer with a pure reducer + stable listener + result hydration. Zero new moving parts, survives service-worker restarts, testable in Node env.
- **Alternative A (rejected)**: switch to `chrome.runtime.sendMessage` response or port-per-request — bigger contract change across background/messages.ts, unnecessary (storage channel is sound).
- **Alternative B (rejected)**: poll storage on an interval — wasteful, racy, worse than hydrate-once + listen.

### Root causes (verified, file:line)
1. **Bug 1** — `src/contents/result-popover.tsx:61-91`: `useEffect` deps `[state]` re-subscribe the `chrome.storage.onChanged` listener every state change; the handler closes over stale `state`. Guard `state.status !== "idle"` (line 73) evaluates against the STALE idle state when request+result land close together → result silently discarded, and no code ever re-reads `POPOVER_RESULT_KEY` from storage → card stuck loading (spinner only, "blank"). Sidepanel works because it reads `chatRoom` written by `processAiRequest`. Mount hydration (lines 46-56) reads ONLY the request key, never the result key.
2. **Bug 2** — `src/contents/floating-overlay.tsx:63-68`: only `mouseup` is listened to. Keyboard selection never fires mouseup; `window.getSelection()` returns "" inside `<input>`/`<textarea>` (lines 45-46) so form-field selection suppresses the pill; double-click can fire mouseup before selection settles.
3. **Bug 3** — `src/contents/floating-overlay.tsx:52-55` adds `window.scrollY/scrollX` (document coords) to `getBoundingClientRect()` values, then applies them to a `position: fixed` container (line 92) which interprets viewport coords → scroll offset applied twice → pill ~`scrollY` px below the selection.
4. **Bug 4** — `src/style.css:55-59`: `* { overscroll-behavior: none; }` disables scroll chaining on EVERY element; message cards have `overflow-hidden` (`src/sidepanel/index.tsx:214`) and code blocks `overflow-x-auto` (`src/components/message-content.tsx:31`) → wheel targets these non-scrollable containers and cannot chain to the chat scroller (`sidepanel/index.tsx:187`). Verified: the `*` rule predates the 83105d9 scroll fix (which was the `#__plasmo` height chain + `:root`), so removing it from `*` does not regress that fix.

### Target files
| File | Action | ~Lines after |
|---|---|---|
| `clipboard-extension/src/shared/popover.ts` | ADD `PopoverState`, `TabFrameInfo`, `applyPopoverRequest`, `applyPopoverResult`, `applyPopoverStorageChanges` | ~130 |
| `clipboard-extension/src/shared/popover-position.ts` | ADD `PILL_WIDTH`, `PILL_HEIGHT`, `PillPlacement`, `computePillPlacement` | ~45 |
| `clipboard-extension/src/shared/capture.ts` | ADD `shouldShowPill(text)` | ~85 |
| `clipboard-extension/src/contents/result-popover.tsx | REWRITE effects 1+2 (stable listener + stateRef + result hydration); import shared state type | ~240 |
| `clipboard-extension/src/contents/floating-overlay.tsx` | REWRITE `handleSelection` (input/textarea + selection), placement via `computePillPlacement`, add debounced `selectionchange`, `onMouseDown` preventDefault on pill root | ~165 |
| `clipboard-extension/src/style.css` | REMOVE `overscroll-behavior: none;` from `*` block (line 58) only | 82 |
| `clipboard-extension/src/sidepanel/index.tsx` | ADD `overscroll-contain` class to chat scroller (line 187) | 264 |
| `clipboard-extension/src/__tests__/popover-position.test.ts` | ADD `computePillPlacement` cases | ~90 |
| `clipboard-extension/src/__tests__/popover.test.ts` | ADD reducer cases (or new `popover-state.test.ts`) | ~150 |
| `clipboard-extension/src/__tests__/capture.test.ts` | ADD `shouldShowPill` boundary cases | ~115 |

All files stay <300 lines. `background.ts`, `messages.ts`, `copy-toast.tsx`, `message-content.tsx`: UNTOUCHED.

### TDD order (repo mandates Red-Green-Refactor)
Write failing tests FIRST for each pure function, then implement, then wire components, then `pnpm build`.

### Step-by-step edits

**Step 1 — `shared/capture.ts`**: add
```ts
export function shouldShowPill(text: string): boolean {
	return text.trim().length > CAPTURE_MIN_LENGTH;
}
```

**Step 2 — `shared/popover-position.ts`**: add (reuse existing `POPOVER_MARGIN`, `POPOVER_GAP`)
```ts
export const PILL_WIDTH = 280;  // estimated rendered pill width
export const PILL_HEIGHT = 36;  // estimated rendered pill height

export type PillPlacement = { left: number; top: number; placement: "below" | "above" };

/** left is the pill CENTER x (container keeps -translate-x-1/2). Viewport coords only. */
export function computePillPlacement(
	rect: { left: number; top: number; width: number; bottom: number },
	viewport: { width: number; height: number }
): PillPlacement {
	const centerX = rect.left + rect.width / 2;
	const minLeft = POPOVER_MARGIN + PILL_WIDTH / 2;
	const maxLeft = Math.max(minLeft, viewport.width - PILL_WIDTH / 2 - POPOVER_MARGIN);
	const left = Math.min(Math.max(centerX, minLeft), maxLeft);
	const belowTop = rect.bottom + POPOVER_GAP;
	if (belowTop + PILL_HEIGHT <= viewport.height - POPOVER_MARGIN) {
		return { left, top: belowTop, placement: "below" };
	}
	const aboveTop = Math.max(POPOVER_MARGIN, rect.top - POPOVER_GAP - PILL_HEIGHT);
	return { left, top: aboveTop, placement: "above" };
}
```

**Step 3 — `shared/popover.ts`**: move `PopoverState` here (delete local type in result-popover.tsx) and add the pure reducer:
```ts
export type PopoverState =
	| { status: "idle" }
	| { status: "loading"; request: PopoverRequest }
	| { status: "done"; request: PopoverRequest; result: string; truncated: boolean }
	| { status: "error"; request: PopoverRequest; code: string };

export type TabFrameInfo = { tabId: number | null; frameId: number };

export function applyPopoverRequest(
	current: PopoverState,
	req: PopoverRequest | undefined,
	info: TabFrameInfo
): PopoverState {
	if (!req) return current;
	if (req.tabId !== info.tabId || req.frameId !== info.frameId) return current;
	if (current.status === "loading" && current.request.requestId === req.requestId) return current;
	return { status: "loading", request: req };
}

export function applyPopoverResult(
	current: PopoverState,
	res: PopoverResult | undefined,
	info: TabFrameInfo
): PopoverState {
	if (!res || current.status !== "loading") return current; // DOMAIN INVARIANT: only a pending load accepts a result
	if (res.requestId !== current.request.requestId) return current; // stale-result guard
	if (res.tabId !== info.tabId || res.frameId !== info.frameId) return current;
	if (res.ok && res.text) {
		return { status: "done", request: current.request, result: res.text, truncated: !!res.truncated };
	}
	return { status: "error", request: current.request, code: res.error || "API_ERROR" };
}

export function applyPopoverStorageChanges(
	current: PopoverState,
	changes: { [key: string]: chrome.storage.StorageChange },
	info: TabFrameInfo
): PopoverState {
	const req = changes[POPOVER_REQUEST_KEY]?.newValue as PopoverRequest | undefined;
	const res = changes[POPOVER_RESULT_KEY]?.newValue as PopoverResult | undefined;
	return applyPopoverResult(applyPopoverRequest(current, req, info), res, info);
}
```
Note: request is applied BEFORE result so a same-batch `{request, result}` resolves straight to done — this is the Bug 1 regression case.

**Step 4 — `contents/result-popover.tsx`**:
- Replace local `PopoverState` with the shared import; import `applyPopoverResult`, `applyPopoverStorageChanges`.
- Add `const stateRef = useRef(state); stateRef.current = state;`
- Effect 1 (mount): after `GET_TAB_ID`, read BOTH keys and resolve through the reducer:
```ts
chrome.storage.local.get([POPOVER_REQUEST_KEY, POPOVER_RESULT_KEY], (storage) => {
	const req = storage[POPOVER_REQUEST_KEY] as PopoverRequest | undefined;
	if (!req || req.tabId !== res.tabId || req.frameId !== res.frameId || Date.now() - req.at >= 30000) return;
	const info = { tabId: res.tabId, frameId: res.frameId };
	const next = applyPopoverResult({ status: "loading", request: req }, storage[POPOVER_RESULT_KEY] as PopoverResult | undefined, info);
	stateRef.current = next;
	setState(next);
});
```
- Effect 2 (listener): stable subscription, deps `[]`, no stale closure, ref updated synchronously so back-to-back events before re-render still see fresh state:
```ts
useEffect(() => {
	const handleStorage = (changes: { [key: string]: chrome.storage.StorageChange }) => {
		const info = tabInfoRef.current;
		if (!info) return;
		const next = applyPopoverStorageChanges(stateRef.current, changes, info);
		if (next !== stateRef.current) {
			stateRef.current = next;
			setState(next);
		}
	};
	chrome.storage.onChanged.addListener(handleStorage);
	return () => chrome.storage.onChanged.removeListener(handleStorage);
}, []);
```
- Everything else (dismissals, placement, copy, retry, JSX) unchanged.

**Step 5 — `contents/floating-overlay.tsx`**:
- Import `computePillPlacement` from `@/shared/popover-position`, `shouldShowPill` from `@/shared/capture`.
- Replace `handleSelection` body with a DOM-glue reader + pure decision:
```ts
const readSelection = (): { text: string; rect: { left: number; top: number; width: number; bottom: number } } | null => {
	const el = document.activeElement;
	if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
		const s = el.selectionStart, e = el.selectionEnd;
		if (s === null || e === null || s === e) return null;
		const text = el.value.slice(s, e).trim();
		if (!shouldShowPill(text)) return null;
		const r = el.getBoundingClientRect();
		return { text, rect: { left: r.left, top: r.top, width: r.width, bottom: r.bottom } };
	}
	const selection = window.getSelection();
	const text = selection?.toString().trim() || "";
	if (!selection || selection.isCollapsed || selection.rangeCount === 0 || !shouldShowPill(text)) return null;
	const r = selection.getRangeAt(0).getBoundingClientRect();
	return { text, rect: { left: r.left, top: r.top, width: r.width, bottom: r.bottom } };
};

const handleSelection = useCallback(() => {
	if (!overlayEnabled) { setVisible(false); return; }
	const sel = readSelection();
	if (!sel) { setVisible(false); return; }
	const placement = computePillPlacement(sel.rect, { width: window.innerWidth, height: window.innerHeight });
	setSelectedText(sel.text);
	setPosition({ top: placement.top, left: placement.left });   // NO window.scrollY/scrollX
	setAnchor({ x: sel.rect.left + sel.rect.width / 2, y: sel.rect.bottom }); // viewport coords — matches computePlacement
	setVisible(true);
}, [overlayEnabled]);
```
- Events effect: keep `mouseup`, ADD debounced `selectionchange` (150ms, timer in a ref, cleared on unmount):
```ts
useEffect(() => {
	let timer: ReturnType<typeof setTimeout> | undefined;
	const onSelectionChange = () => {
		clearTimeout(timer);
		timer = setTimeout(handleSelection, 150);
	};
	document.addEventListener("mouseup", handleSelection);
	document.addEventListener("selectionchange", onSelectionChange);
	return () => {
		clearTimeout(timer);
		document.removeEventListener("mouseup", handleSelection);
		document.removeEventListener("selectionchange", onSelectionChange);
	};
}, [handleSelection]);
```
- Pill root div: add `onMouseDown={(e) => e.preventDefault()}` — keeps the text selection alive while clicking pill buttons (also prevents focus theft).
- Remove nothing else; `position` state stays `{top,left}` applied to the `fixed -translate-x-1/2` container.

**Step 6 — `style.css`**: in the `*` block (lines 55-59) delete ONLY `overscroll-behavior: none;`. Keep `-ms-overflow-style` + `scrollbar-width`. Keep `:root { overscroll-behavior: none; }` (lines 80-82).

**Step 7 — `sidepanel/index.tsx`**: line 187 chat scroller gains `overscroll-contain`:
`className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-4 pt-4 pb-4"`.

### Component states (result card)
- loading → spinner + "<Title>ing..." (unchanged)
- done → MessageContent + truncated note (unchanged)
- error → message + Retry (unchanged; Retry re-triggers with NEW requestId → reducer returns to loading)
- NEW guarantee: loading resolves even if result event was missed (hydration + same-batch + stable listener cover all three loss windows).

### Edge matrix
| Edge | Expected behavior | Covered by |
|---|---|---|
| request+result in one onChanged batch | straight to done/error | reducer test |
| result written before listener ready / component remount | mount hydration reads both keys → done | hydration code + reducer test (same function) |
| stale `POPOVER_RESULT_KEY` from previous request when new request starts | ignored (requestId mismatch) | reducer test — DOMAIN INVARIANT |
| result for other tab/frame | ignored | reducer test |
| result while idle (dismissed) | ignored (`status !== "loading"`) | reducer test |
| duplicate request event (same requestId while loading) | no state churn (referential equality) | reducer test |
| keyboard selection / double-click | selectionchange (debounced 150ms) fires pill | DOM glue (manual) |
| selection inside input/textarea | pill anchored below the field | DOM glue (manual) |
| selection ≤5 chars trimmed | no pill (consistent with copy-capture) | shouldShowPill tests |
| selection near bottom edge | pill flips above | computePillPlacement test |
| selection at left/right viewport edge | center-x clamped to margins | computePillPlacement test |
| wheel over `overflow-hidden` card / `overflow-x-auto` pre | chains to chat scroller; contained at chat boundary | CSS change (manual/build) |
| multi-line selection rect (huge width) | centerX clamped, still correct | computePillPlacement test |

### Test contracts (fill these exact cases)
`__tests__/popover.test.ts` (or new `popover-state.test.ts`) — reducer:
1. `idle + matching request → loading`
2. `idle + request(other tabId) → idle`
3. `idle + request(other frameId) → idle`
4. `loading + result(ok, matching requestId, text, truncated:true) → done{result,truncated:true}`
5. `loading + result(ok, text empty string) → error{code:"API_ERROR"}`
6. `loading + result(!ok, error:"LIMIT_REACHED") → error{code:"LIMIT_REACHED"}`
7. `idle + {request AND result} same changes object → done` (Bug 1 regression)
8. `loading + result(stale requestId from previous request) → stays loading, same reference` (Domain invariant)
9. `idle + result only (no request) → idle, same reference`
10. `done + result(duplicate) → same reference (results only resolve loading)`
11. `loading + duplicate request(same requestId) → same reference`
12. `loading + result(ok) but tabId mismatch → stays loading`

`__tests__/popover-position.test.ts` — `computePillPlacement`:
13. rect mid-viewport → `{placement:"below", top: rect.bottom+8}` and left = centerX
14. rect.bottom + 8 + 36 > viewport.height - 12 → flips above: top = max(12, rect.top - 8 - 36)
15. centerX < 12 + 140 → left clamped to 152
16. centerX > viewport.width - 152 → left clamped to viewport.width - 152

`__tests__/capture.test.ts` — `shouldShowPill`:
17. `"  hello  "` (5 chars trimmed) → false
18. `"hello world"` → true; `""` / `"   "` → false

### Verification exit criteria (ALL must pass; same criterion failing twice = BLOCKED)
- [ ] `pnpm test` in `clipboard-extension/` → all files green, ≥84 tests passing (67 baseline + ≥17 new), 0 skipped/failing — vitest exit 0
- [ ] `pnpm build` in `clipboard-extension/`` → succeeds (exit 0), `build/` artifacts produced
- [ ] `rg -n "window\.scrollY|window\.scrollX" src/contents/floating-overlay.tsx` → no matches (Bug 3 regression guard)
- [ ] `rg -n "overscroll-behavior" src/style.css` → matches ONLY inside the `:root` block, none in `*` block (Bug 4 guard)
- [ ] `rg -n "overscroll-contain" src/sidepanel/index.tsx` → ≥1 match on the chat scroller div
- [ ] `rg -n "\}, \[state\]\);" src/contents/result-popover.tsx` → no matches (stale-closure listener is gone; subscription effect deps are `[]`)
- [ ] `rg -n "selectionchange" src/contents/floating-overlay.tsx` → ≥1 addEventListener match (Bug 2 guard)
- [ ] `rg -n "shouldShowPill" src/shared/capture.ts src/contents/floating-overlay.tsx` → defined + used
- [ ] `git diff --stat` → only the 10 files in Target files table touched; background.ts / messages.ts / copy-toast.tsx / message-content.tsx untouched

### Build & verify commands
- Test: `pnpm test` (vitest run, Node env)
- Build: `pnpm build` (plasmo build; requires `.env` — already copied into worktree)
- Logs: stdout of the commands above; no server involved.

### Security notes
- No new permissions, hosts, or message types. Reducer validates tabId/frameId/requestId on every result (prevents cross-tab card injection via shared storage). No user input reaches innerHTML (MessageContent already renders text). `onMouseDown preventDefault` is local to the pill root only.
