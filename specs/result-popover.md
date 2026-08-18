# Result Popover (macOS "Look Up"-style) + Sidepanel Scroll Fix

Branch: `feat/result-popover` · Worktree: `.worktrees/result-popover`
Date: 2026-08-19 · All paths relative to `clipboard-extension/` unless noted.

---

## Section 1 — Product

### Goal & scope
1. **Fix the sidepanel chat scroll bug for real.** After 20+ messages the chat must scroll inside its own container; the input bar stays pinned at the bottom. Previous "h-full flex" fix (commit 9083791) was correct at the component level but missed one link in the height chain (root cause below).
2. **Inline Result Popover card.** When the user clicks **Explain** or **Summarize** — on the selection pill OR on the copy-capture toast — the AI result appears in a small floating card ("popover" is the UI term; macOS calls this pattern "Look Up") anchored near the selected text / mouse click point. Flip above the anchor when there's no room below. Card shows: title, scrollable result text, Copy button, "Open in chat", and ✕ close. Loading and error states included (AI fetch takes seconds and can fail).
3. Results **also** continue landing in the sidepanel chat exactly as today (existing `chatRoom` append is untouched).

### Out of scope (NOT building)
- No new AI endpoints, no background AI-logic changes beyond result relay.
- No popover on selection-without-click (card opens only after an Explain/Summarize click).
- No popover persistence across page navigations or scroll (scroll dismisses it; result remains in chat).
- No new npm dependencies. No manifest permission changes.
- No multi-popover stacking — exactly one card at a time.

### User stories / acceptance criteria
- **US1 Scroll**: With 20+ messages in sidepanel chat, the message list scrolls; input bar never leaves the viewport; auto-scroll-to-newest still works.
- **US2 Selection→Explain**: Select text → pill appears → click Explain → pill hides → popover card opens near the selection within ~200ms showing a loading state → when AI responds, card shows the result (scrollable if long). Result also appears in sidepanel chat.
- **US3 Selection→Summarize**: identical, title "Summarize".
- **US4 Copy-capture flow**: Ctrl+C with capture on → corner toast → click Explain/Summarize → toast hides → same popover card anchored near the click point.
- **US5 Card controls**: ✕ closes; Esc closes; clicking outside closes; Copy button copies result text and shows ✓ for 2s; "Open in chat" opens the sidepanel.
- **US6 Replace**: clicking Explain on a new selection while a card is open replaces the card content (back to loading). Never two cards.
- **US7 Error**: AI failure shows a friendly error inside the card (same messages as chat) with a Retry button.
- **US8 Flip**: card near bottom edge of viewport renders above the anchor; card never renders off-screen horizontally.

### Behavior change (flagged for Reviewer)
Pill/toast Explain & Summarize currently auto-overwrite the clipboard with the result. With an explicit Copy button in the card this silent overwrite is removed for these two actions (the pill's plain **Copy** button keeps copying the raw selection). Rationale: user explicitly requested card-level Copy; double-copy is surprising. Chat history append unchanged.

### Open question / known edge (reported, not silently decided)
- `chrome.sidePanel.open()` requires a user gesture; called from background in response to a card-button click it works in current Chrome, but if it ever throws we swallow and still respond `{success:true}` (panel remains reachable via Alt+C). Not worth a permission or workaround today.

---

## Section 2 — Engineering Handoff

### Root cause analysis (verified against code, not assumed)

**Scroll bug.** `src/sidepanel/index.tsx:273` root is `div.h-full.flex.flex-col`; message list (line 274) is `flex-1 overflow-y-auto`; input bar (line 315) is `shrink-0` — all correct. `src/style.css:68-71` sets `html, body { height: 100% }`. The missing link: Plasmo mounts the sidepanel React tree into `<div id="__plasmo"></div>` inside `.plasmo/sidepanel.html` (generated at build). That div has **no height**, so the root's `h-full` resolves against `height:auto` → collapses to content height → `overflow-y-auto` never overflows → no scroll, input bar pushed off-screen. Fix: style the mount div.

**Current AI flow (verified).** Pill (`src/contents/floating-overlay.tsx:79-89`) and toast (`src/contents/copy-toast.tsx:85-101`) both send `{type:"SELECTED_TEXT", text}`; the toast smuggles the mode via a text prefix `"explain the following text: …"` and the pill sends raw text (its Explain and Summarize buttons are currently functionally identical). Background `processAiRequest` appends user+bot messages to `chatRoom` in `chrome.storage.local` and returns `{modifiedText}` which the content script copies to the clipboard. The sidepanel renders chat purely from `chrome.storage.onChanged` (`sidepanel/index.tsx:138-172`).

### Architecture decision (in-spec ADR)

**Chosen: storage-relay channel with requestId + tabId + frameId correlation.**
- Content script (pill/toast) sends one `AI_ACTION` runtime message. Background stamps `sender.tab.id` + `sender.frameId`, writes `popoverRequest` to storage (opens card in loading state), runs the existing `processAiRequest` (chat append untouched), then writes `popoverResult` keyed by `requestId`. Popover CSUI filters both storage events by its own `(tabId, frameId)` and matches results by `requestId`.
- **Why not** custom DOM events: pill/toast/popover live in separate shadow roots and separate frames; window events don't cross iframe boundaries.
- **Why not** direct sendMessage to the popover: content scripts cannot message each other; only background can route.
- **Why correlation IDs (domain invariant):** two production breaks the user didn't mention:
  1. *Cross-tab/cross-frame ghosts*: `storage.onChanged` fires in every content-script instance of every tab (and every iframe — pill/toast run `all_frames: true`). Without `(tabId, frameId)` filtering, a popover opens in ALL tabs simultaneously.
  2. *Chat/popover race*: if the popover naively watched `chatRoom` for "the last bot message", a concurrent sidepanel CHAT answer would render in the popover instead of the Explain result. `requestId` makes the popover's result unambiguous.

### Target files

| Action | Path | Est. lines |
|---|---|---|
| Modify | `src/style.css` | +6 |
| Modify | `src/shared/messages.ts` | ~+55 |
| Create | `src/shared/popover.ts` | ~90 |
| Create | `src/shared/popover-position.ts` | ~55 |
| Create | `src/shared/errors.ts` | ~25 (moved code) |
| Modify | `src/background.ts` | ~+70 |
| Create | `src/contents/result-popover.tsx` | ~290 |
| Modify | `src/contents/floating-overlay.tsx` | ~±30 |
| Modify | `src/contents/copy-toast.tsx` | ~±15 |
| Create | `src/components/message-content.tsx` | ~85 (moved code) |
| Modify | `src/sidepanel/index.tsx` | ~−70 (moved code) |
| Modify | `src/__tests__/contracts.test.ts` | +~60 |
| Modify | `src/__tests__/background.test.ts` | +~70 |
| Create | `src/__tests__/popover.test.ts` | ~70 |
| Create | `src/__tests__/popover-position.test.ts` | ~60 |

All files ≤300 lines after change. No schema/migrations (extension uses `chrome.storage.local` keys only).

### 1. Sidepanel scroll fix — `src/style.css`

Append inside the existing final `@layer base` block:

```css
	/* Plasmo mounts the sidepanel into #__plasmo; without an explicit height
	   the h-full chain from html/body breaks at this div and the chat never scrolls. */
	#__plasmo {
		height: 100%;
	}

	body {
		overflow: hidden; /* single scrollbar: the message list, never the page */
	}
```

After the first `pnpm build`, verify `.plasmo/sidepanel.html` contains `<div id="__plasmo"></div>` and the compiled bundle CSS contains the `#__plasmo` rule. If Plasmo's mount id differs in this version, change the selector to the actual id (do not ship an unverified selector).

### 2. Message contracts — `src/shared/messages.ts`

Extend `ExtensionRequest` union with:

```ts
	| {
			type: "AI_ACTION";
			text: string; // already prompt-composed by the sender
			action: "explain" | "summarize";
			requestId: string;
			anchor: { x: number; y: number }; // client (viewport) coords
			source: "selection" | "copy";
	  }
	| { type: "GET_TAB_ID" }
	| { type: "OPEN_SIDEPANEL" }
```

Extend responses:

```ts
export type TabInfoResponse = { tabId: number | null; frameId: number };
export type ExtensionResponse = CommandResponse | AiRequestResponse | TabInfoResponse;
```

Extend `isExtensionRequest` switch (preserve the never-throws guard invariant):

```ts
		case "AI_ACTION":
			return (
				(msg.action === "explain" || msg.action === "summarize") &&
				typeof msg.text === "string" &&
				typeof msg.requestId === "string" &&
				msg.requestId.length > 0 &&
				(msg.source === "selection" || msg.source === "copy") &&
				typeof msg.anchor === "object" &&
				msg.anchor !== null &&
				Number.isFinite((msg.anchor as { x: number }).x) &&
				Number.isFinite((msg.anchor as { y: number }).y)
			);
		case "GET_TAB_ID":
		case "OPEN_SIDEPANEL":
			return true;
```

Do NOT touch `TOGGLE_SWITCH` / `RESET_HISTORY` / `SELECTED_TEXT` / `CHAT` cases.

### 3. New `src/shared/popover.ts`

```ts
import type { ExtensionRequest } from "./messages";

export const POPOVER_REQUEST_KEY = "popoverRequest";
export const POPOVER_RESULT_KEY = "popoverResult";

export type PopoverAction = "explain" | "summarize";
export type PopoverAnchor = { x: number; y: number };

export type PopoverRequest = {
	requestId: string;
	tabId: number | null;
	frameId: number;
	action: PopoverAction;
	text: string; // RAW source text (not prompt-composed) — powers Retry
	anchor: PopoverAnchor;
	source: "selection" | "copy";
	at: number; // epoch ms
};

export type PopoverResult = {
	requestId: string;
	tabId: number | null;
	frameId: number;
	ok: boolean;
	text?: string;            // present when ok
	error?: AiRequestError;   // present when !ok
	truncated?: boolean;
	at: number;
};

export function buildRequestId(): string {
	// crypto.randomUUID is available in MV3 content scripts; fallback for safety
	return typeof crypto !== "undefined" && "randomUUID" in crypto
		? crypto.randomUUID()
		: `r-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function composePrompt(action: PopoverAction, text: string): string {
	const verb = action === "explain" ? "Explain" : "Summarize";
	return `${verb} the following text:\n\n${text}`;
}

/** Fire an AI action: background relays popoverRequest and later popoverResult.
 *  Sends the RAW text — the background owns prompt composition (single source),
 *  so the popover's Retry path can re-send request.text without double-prefixing. */
export function triggerAiAction(opts: {
	action: PopoverAction;
	text: string;
	anchor: PopoverAnchor;
	source: "selection" | "copy";
}): string {
	const requestId = buildRequestId();
	const message: ExtensionRequest = {
		type: "AI_ACTION",
		text: opts.text,
		action: opts.action,
		requestId,
		anchor: opts.anchor,
		source: opts.source,
	};
	chrome.runtime.sendMessage(message, () => {
		// Swallow (log) lastError: the popover channel is storage-based; the
		// direct response is not consumed by the trigger UI anymore.
		if (chrome.runtime.lastError) console.error(chrome.runtime.lastError.message);
	});
	return requestId;
}
```

Import `AiRequestError` type where needed. Prompt composition lives in the **background** (see §7): the chat's user bubble shows the composed prompt — identical to today's copy-toast behavior, and it makes pill Explain/Summarize actually differ. `composePrompt` stays in `shared/popover.ts` but is called by `background.ts`, not by `triggerAiAction`.

### 4. New `src/shared/popover-position.ts` (pure, unit-tested)

```ts
export const POPOVER_WIDTH = 360;
export const POPOVER_MARGIN = 12;   // min distance from viewport edges
export const POPOVER_GAP = 8;       // gap between anchor point and card
export const POPOVER_MAX_HEIGHT = 320; // also the card body max-height

export type PopoverPlacement = { left: number; top: number; placement: "below" | "above" };

export function computePlacement(
	anchor: { x: number; y: number },
	viewport: { width: number; height: number }
): PopoverPlacement {
	const maxLeft = Math.max(POPOVER_MARGIN, viewport.width - POPOVER_WIDTH - POPOVER_MARGIN);
	const left = Math.min(Math.max(anchor.x - POPOVER_WIDTH / 2, POPOVER_MARGIN), maxLeft);
	const belowTop = anchor.y + POPOVER_GAP;
	if (belowTop + POPOVER_MAX_HEIGHT <= viewport.height - POPOVER_MARGIN) {
		return { left, top: belowTop, placement: "below" };
	}
	const aboveTop = Math.max(POPOVER_MARGIN, anchor.y - POPOVER_GAP - POPOVER_MAX_HEIGHT);
	return { left, top: aboveTop, placement: "above" };
}
```

### 5. Move (not copy) `getErrorMessage` → `src/shared/errors.ts`

Move the function verbatim from `src/sidepanel/index.tsx:10-29` (it maps `AiRequestError` → friendly strings). In `sidepanel/index.tsx` replace the definition with `import { getErrorMessage } from "@/shared/errors";` and keep a re-export (`export { getErrorMessage };`) so any existing importer keeps working. The popover imports it from `@/shared/errors`.

### 6. Move (not copy) `MessageContent` → `src/components/message-content.tsx`

Move `CodeBlock` (lines 31-61), `FENCE_RE` (line 74) and `MessageContent` (lines 76-109) out of `src/sidepanel/index.tsx` into the new component file (imports: React hooks, `Button`, `Copy`/`Check` icons, `cn`). Sidepanel imports `MessageContent` from it. **The popover reuses the same component** so code-fenced AI answers render identically in card and chat. No behavior change.

### 7. Background relay — `src/background.ts`

In the `onMessage` listener: rename `_sender` → `sender`. Add three cases (keep existing cases byte-identical):

```ts
case "GET_TAB_ID": {
	sendResponse({ tabId: sender?.tab?.id ?? null, frameId: sender?.frameId ?? 0 });
	return false;
}

case "OPEN_SIDEPANEL": {
	(async () => {
		try {
			const win = await chrome.windows.getLastFocused();
			if (win?.id != null) {
				// @ts-ignore sidePanel is not yet in @types/chrome
				await chrome.sidePanel?.open?.({ windowId: win.id });
			}
		} catch {
			/* best-effort: panel also reachable via Alt+C */
		}
		sendResponse({ success: true });
	})();
	return true;
}

case "AI_ACTION": {
	const text = validateInput(message.text);
	if (text === null) {
		sendResponse({ error: "INVALID_INPUT" });
		return false;
	}
	const composed = composePrompt(message.action, text);
	const meta = {
		requestId: message.requestId,
		tabId: sender?.tab?.id ?? null,
		frameId: sender?.frameId ?? 0,
	};
	const writePopoverRequest = enqueueWrite(async () => {
		await new Promise<void>((resolve) => {
			chrome.storage.local.set(
				{ [POPOVER_REQUEST_KEY]: { ...meta, action: message.action, text, anchor: message.anchor, source: message.source, at: Date.now() } },
				resolve
			);
		});
	});
	writePopoverRequest.catch(() => {});
	processAiRequest(composed)
		.then(async (result: AiRequestResponse) => {
			const payload: PopoverResult =
				"modifiedText" in result
					? { ...meta, ok: true, text: result.modifiedText, truncated: result.truncated ?? false, at: Date.now() }
					: { ...meta, ok: false, error: result.error, at: Date.now() };
			await new Promise<void>((resolve) => {
				chrome.storage.local.set({ [POPOVER_RESULT_KEY]: payload }, resolve);
			});
			sendResponse(result);
		})
		.catch(() => {
			// Structured error, no user content logged (existing pattern).
			console.error("Unhandled error processing AI_ACTION");
			const payload: PopoverResult = { ...meta, ok: false, error: "API_ERROR", at: Date.now() };
			chrome.storage.local.set({ [POPOVER_RESULT_KEY]: payload }, () => { void 0; });
			sendResponse({ error: "API_ERROR" });
		});
	return true; // async response
}
```

Notes: `processAiRequest` is untouched (chat append, limit, badge, retry all preserved). Import `PopoverResult`, `POPOVER_REQUEST_KEY`, `POPOVER_RESULT_KEY` from `@/shared/popover` (use relative `./shared/popover` to match file's existing relative import style). `frameId` is always defined for content-script senders; `tabId` is null for extension-page senders (sidepanel/popup never send `AI_ACTION`, so null tabId is only a defensive path).

### 8. New CSUI — `src/contents/result-popover.tsx`

Follow the structural pattern of `copy-toast.tsx` exactly:

```ts
import type { PlasmoCSConfig } from "plasmo";
export const config: PlasmoCSConfig = { matches: ["<all_urls>"], all_frames: true };
export const getStyle = () => { /* same styleText injection as copy-toast */ };
```

Component behavior (state machine `idle → loading → done | error`):

- **Mount**: `chrome.runtime.sendMessage({type:"GET_TAB_ID"}, cb)` → cache `{tabId, frameId}` in a ref. Until it arrives the component renders nothing (requests that early are re-readable from storage: also do a one-time `chrome.storage.local.get([POPOVER_REQUEST_KEY])` on mount and open if the cached request is < 30s old and matches — covers the race where the request lands before tabId resolution).
- **storage.onChanged** (local area):
  - `popoverRequest` where `tabId`/`frameId` match own → replace state with `loading` for that `requestId` (US6 replace semantics; card content swaps, never stacks). Store request + compute placement once via `useMemo` from `anchor` + `window.innerWidth/innerHeight`.
  - `popoverResult` where `requestId === currentRequestId` AND tab/frame match → `ok ? done(text) : error(code)`. Ignore non-matching ids (stale results from replaced requests).
- **Dismiss** → `idle`: ✕ button; `Escape` on `document.keydown`; outside `mousedown` on `document` (check `!event.composedPath().includes(cardRef.current)`); `scroll` (capture: true, catches inner scrollers) and `resize` on `window`. All listeners added in one `useEffect` keyed on open-state with proper cleanup.
- **Render** (only when not idle): wrapper div `fixed z-[99999]`, inline `style={{ left, top }}` from `computePlacement`, `maxWidth: "calc(100vw - 24px)"`, `w-[360px]`, classes mirroring copy-toast card: `rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150`, `role="dialog"` `aria-label="AI result"`.
- **Header**: `Sparkles` (explain) / `FileText` (summarize) icon + title `Explain`/`Summarize` + ghost icon Button with `X`, `aria-label="Close"`.
- **Body** `max-h-[320px] overflow-y-auto p-3.5 text-sm`:
  - loading → spinner (`animate-spin` ring) + `Explaining…` / `Summarizing…`
  - done → `<MessageContent text={result} />`; if `truncated` show a `text-xs text-slate-400` note "Input was trimmed"
  - error → red box matching sidepanel error style (`bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400`) with `getErrorMessage(code)` + a `Retry` button. Retry = `triggerAiAction({ action: request.action, text: request.text, anchor: request.anchor, source: request.source })` — `request.text` is the RAW source text stored in `popoverRequest`, and `triggerAiAction` sends raw (background composes), so retry never double-prefixes. Implement as ONE handler used by the button; delete any placeholder/dead retry code.
- **Footer** `flex justify-between border-t border-slate-100 dark:border-slate-800 px-3.5 py-2`:
  - Copy: ghost Button, `Copy`/`Check` icons, copies `result` via `navigator.clipboard.writeText` with `.catch` fallback to `document.execCommand("copy")` via a temporary textarea (defensive for clipboard-permission-strict hosts); ✓ for 2s (existing pattern).
  - Open in chat: ghost Button, `MessagesSquare` icon (lucide, already a dependency), sends `{type:"OPEN_SIDEPANEL"}`.
- Never renders when the extension is disabled — background won't write `popoverRequest` for disabled state (`processAiRequest` returns `DISABLED` → popoverResult error → card shows "Extension is paused…" via `getErrorMessage`). This is correct: user sees why nothing happened.

### 9. Pill integration — `src/contents/floating-overlay.tsx`

- In `handleSelection`, additionally store client-coords anchor: `setAnchor({ x: rect.left + rect.width / 2, y: rect.bottom })` (new state; keep existing page-coords `position` for the pill itself).
- `handleAction("explain" | "summarize")`: `setVisible(false); triggerAiAction({ action, text: selectedText, anchor, source: "selection" });` — **remove** the old `SELECTED_TEXT` sendMessage + clipboard-write callback for these branches. The `copy` branch is unchanged.
- Import `triggerAiAction` from `@/shared/popover`.

### 10. Toast integration — `src/contents/copy-toast.tsx`

- `handleAction(action)` becomes `handleAction(action, e: React.MouseEvent)`: `dismiss(); triggerAiAction({ action, text: capturedText, anchor: { x: e.clientX, y: e.clientY }, source: "copy" });` — remove old sendMessage + clipboard-write callback. Pass the event from the two Buttons' `onClick`.

### 11. Tests (vitest; existing chrome-mock patterns in `src/__tests__/background.test.ts`)

**`contracts.test.ts` additions** (mirror existing style):
- valid `AI_ACTION` (explain), valid (summarize), valid (source copy) → guard true
- invalid action value / empty requestId / missing text / bad source → false
- anchor `NaN` / `Infinity` / missing → false
- `GET_TAB_ID`, `OPEN_SIDEPANEL` → true; unknown type → false

**New `popover.test.ts`**:
- `composePrompt("explain", "x")` → `"Explain the following text:\n\nx"`; summarize variant
- `buildRequestId()` → non-empty, two calls differ
- `triggerAiAction` sends `AI_ACTION` with RAW text (no prefix) + valid requestId/anchor/source (mock `chrome.runtime.sendMessage`)
- `POPOVER_REQUEST_KEY === "popoverRequest"`, `POPOVER_RESULT_KEY === "popoverResult"`

**New `popover-position.test.ts`** (pure math, table-driven):
- mid-viewport anchor → placement below, left centered & clamped
- anchor near bottom (y = height − 10) → placement above
- anchor near left edge → left clamped to `POPOVER_MARGIN`
- anchor near right edge → left clamped to `width − POPOVER_WIDTH − MARGIN`
- tiny viewport (width 300) → left = `POPOVER_MARGIN` (Math.max guard), no NaN
- above-flip clamped at top (`top ≥ POPOVER_MARGIN`) when anchor is high but below-space insufficient (e.g. viewport height 400)

**`background.test.ts` additions** (reuse the file's chrome mock setup):
- `AI_ACTION` with mocked successful fetch → `popoverRequest` written with sender tab/frame ids, then `popoverResult` `{ok:true, text}` written; `chatRoom` appended (existing behavior preserved)
- `AI_ACTION` with failing fetch (mock 500 exhausts retries — reuse existing retry-mock pattern) → `popoverResult` `{ok:false, error:"SERVER_ERROR"}`
- `GET_TAB_ID` → responds `{tabId: <sender tab id>, frameId: <sender frame id>}`
- `OPEN_SIDEPANEL` → responds `{success:true}` (mock `chrome.windows.getLastFocused`, tolerant if `sidePanel.open` absent)
- `AI_ACTION` with empty text → `{error:"INVALID_INPUT"}`, no storage writes

### Edge matrix

| Edge | Expected behavior |
|---|---|
| New request while card open | replaces card content → loading; old popoverResult ignored (requestId mismatch) |
| CHAT sent from sidepanel while popover loading | popover unaffected (requestId correlation); chat updates normally |
| Same request fired from two tabs | card opens only in the originating tab+frame (tabId/frameId filter) |
| Result > 320px tall | body scrolls inside card; card never exceeds viewport |
| Viewport < 384px wide | card `maxWidth: calc(100vw-24px)`; left clamped |
| Page scrolled while card open | card dismisses (result still in chat) |
| AI error (429/5xx exhausted) | error state + Retry; badge/limits behavior unchanged |
| Extension paused (`isOn:false`) | card shows "Extension is paused…" error text |
| Empty/whitespace text | background rejects `INVALID_INPUT` before opening card (validateInput first) — pill/toast already only fire for non-empty text |
| clipboard write denied | fallback `execCommand` path; failure logged, no crash |
| `crypto.randomUUID` unavailable | fallback id generator (no collision in practice) |
| Stale popoverRequest in storage at mount | only honored if < 30s old AND tab/frame match |
| 10k-char selection | existing `clampInput` path; `truncated` note rendered in card |

### Vertical slices (implementation order, each independently verifiable)

1. **Scroll fix**: style.css edit → `pnpm build` → inspect `.plasmo/sidepanel.html` + compiled CSS.
2. **Contracts + pure utils**: messages.ts, popover.ts, popover-position.ts, errors.ts move + their tests → `pnpm test` green (no runtime change yet).
3. **Background relay** + background tests.
4. **Popover CSUI + pill/toast integration + message-content move** → build.
5. **Full verification pass** (exit criteria below).

### Verification commands

- Install/test/build (in `clipboard-extension/`): `pnpm install && pnpm test && pnpm build`
- `.env` already copied into worktree (PM did). Final shipping build happens in the main repo after merge — do not commit `.env`.

### Verification Exit Criteria (Engineer MUST check ALL boxes before DONE)

- [ ] `pnpm test` exits 0 — all 50 existing tests still pass AND ≥15 new tests pass (contracts ≥8, popover ≥3, popover-position ≥6, background ≥5) — paste final vitest summary
- [ ] `pnpm build` exits 0 — paste tail of build output
- [ ] `grep -o '<div id="[^"]*"' .plasmo/sidepanel.html` shows the Plasmo mount div id AND that id is the one styled in `src/style.css` with `height: 100%` (adjust selector if id differs; re-run build)
- [ ] Compiled sidepanel CSS in `build/` contains the `#__plasmo` (or actual id) height rule — `grep -r "#__plasmo" build/chrome-mv3/ | head -3`
- [ ] `rg "EXPLAIN_SELECTION|SUMMARIZE_SELECTION|EXPLAIN_CLIPBOARD" src/` returns no matches (guards against phantom message types)
- [ ] `rg -c "triggerAiAction" src/contents/floating-overlay.tsx src/contents/copy-toast.tsx` → both ≥ 1
- [ ] `git diff -- package.json` shows zero dependency/manifest changes (no new deps, no new permissions)
- [ ] `wc -l src/contents/result-popover.tsx src/shared/popover.ts src/shared/popover-position.ts src/shared/errors.ts src/components/message-content.tsx` → all ≤ 300
- [ ] `rg "SELECTED_TEXT" src/contents/` returns no matches (old trigger path fully replaced in pill/toast)
- [ ] `rg "getErrorMessage" src/sidepanel/index.tsx` shows import/re-export from `@/shared/errors` (single source of truth)
- [ ] Manual smoke checklist (load `build/chrome-mv3` unpacked in Chrome; run through): ① sidepanel with 20+ messages scrolls, input pinned ② pill Explain opens card near selection, result renders + lands in chat ③ copy-toast flow card near click point ④ ✕ / Esc / outside-click / scroll dismiss ⑤ card flips above near page bottom ⑥ Copy button copies ⑦ Retry after killing network. Record pass/fail per item in the return message (a local `chrome://extensions` load; screenshot optional).

### Manual QA checklist (for the user, after merge — PM will surface this)

Same ①-⑦ as the smoke checklist above, plus dark-mode site check (card uses light/dark slate variants keyed off the page's `dark` class, same as the existing toast).

### Security review points (Reviewer focus)

- `isExtensionRequest` guards all new types; malformed anchors (NaN/Infinity) rejected → no weird fixed-position injection via message.
- No new permissions, no new hosts. Clipboard writes only in user-gesture handlers with execCommand fallback.
- Background error paths log codes only, never user text (existing invariant — keep it in new `catch`).
- Storage values are extension-local; `requestId` is a correlation id, not an auth token.
