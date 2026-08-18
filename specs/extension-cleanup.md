# Extension Cleanup and Production Readiness

## Product

### Goal and scope
Complete the Plasmo extension cleanup in `clipboard-extension`: remove unnecessary/dead surface area, make storage and runtime messaging typed and reliable, unify popup/sidepanel visuals around Mantine + existing Tailwind, and harden service-worker backend requests for a production MV3 build.

### Out of scope
- No new AI features, backend endpoints, authentication provider, or billing flow.
- No broad host-permission redesign beyond removing the explicitly unnecessary clipboard permission.
- No redesign of the web app or backend.

### Acceptance criteria
1. Production manifest/build contains only required permissions; `clipboardRead` and the placeholder options entry are absent unless a concrete runtime reference proves they are required.
2. Popup and sidepanel share one coherent light design system: consistent surface/background, typography, spacing, radius, primary action color, focus states, and responsive behavior; the custom complex toggle is replaced by an accessible Mantine or semantic switch.
3. Sidepanel loads `limit` and `chatRoom` with one storage read, never performs redundant sequential reads, and reacts to storage changes without stale UI.
4. Runtime messages between content script, popup, sidepanel, and service worker use shared discriminated types and validate unknown messages/input; callback errors are surfaced without uncaught runtime errors.
5. Debug logging is removed from user flows; failures use structured, non-sensitive error logging and user-safe messages.
6. Service-worker backend calls have an explicit auth/API-key header seam sourced from environment/configuration without committing secrets, and do not send an empty or accidental credential.
7. Typecheck, tests, and production Plasmo build pass; no secret, broad unsafe logging, dead entrypoint, or console-debug regression remains.

## Engineering Handoff

### Domain invariant / production gap
The request does not specify behavior when the backend credential is missing or the service worker receives malformed/untrusted runtime messages. If this is not defined, production can send unauthenticated requests or crash on malformed extension messages; implement safe rejection (`API_ERROR`/`INVALID_INPUT`) without exposing secrets and cover it in tests.

### Architectural decision and scaling tradeoffs
Keep the existing MV3 service-worker single-writer queue and `chrome.storage.local` persistence. Add small shared message/type utilities rather than a state library. This is YAGNI for the current single-user extension and avoids new runtime/dependency risk. Do not introduce a new auth library or database.

### Target files
- `clipboard-extension/package.json`: remove `clipboardRead`; preserve required permissions and host permission.
- `clipboard-extension/src/background.ts`: typed message contract, input validation, safe backend request header seam, structured error handling; preserve queue, alarms, badges, and storage semantics.
- `clipboard-extension/src/contents/site-one.ts`: consume shared message types and remove unsafe/duplicate logging.
- `clipboard-extension/src/popup/index.tsx`: shared Mantine theme/provider, loading/error state, typed toggle/open messages, unified layout.
- `clipboard-extension/src/sidepanel/index.tsx`: single initial storage read, shared types/theme, accessible states, responsive layout, retry-safe messaging, no debug logs.
- `clipboard-extension/src/components/button.tsx`: replace custom CSS toggle with Mantine `Switch` or equivalent semantic control; preserve public props or update all call sites.
- `clipboard-extension/src/style.css`, `src/button.css`: remove obsolete skeuomorphic/complex toggle rules and retain only styles used by active surfaces.
- `clipboard-extension/src/options/index.tsx`: delete only if no manifest/config/reference requires it; otherwise make it a real minimal settings surface only if required by current product.
- `clipboard-extension/src/shared/messages.ts` (create only if existing conventions have no shared type module): discriminated request/response types and runtime guards.
- `clipboard-extension/src/__tests__/background.test.ts`: extend executable contracts.

### Dependencies and imports
Use existing `@mantine/core` 7.15.2, React 18, TypeScript 5.3, Tailwind 3, Vitest 2, and `@types/chrome`. Reuse `MantineProvider`, `Button`, and `Switch`; no new dependency. If creating a theme, use `createTheme` from `@mantine/core` and import it from popup/sidepanel.

### API and message contracts
Define shared discriminated requests:
- `{ type: "TOGGLE_SWITCH"; isOn: boolean }`
- `{ type: "RESET_HISTORY" }`
- `{ type: "SELECTED_TEXT"; text: string }`
- `{ type: "CHAT"; chatMessage: string }`
Responses: `{ success: true }` for commands, or `{ modifiedText: string }` / `{ error: "DISABLED" | "LIMIT_REACHED" | "API_ERROR" | "INVALID_INPUT" }` for AI requests. Unknown types and wrong fields must receive a safe error/no-op and never throw. Trim and reject empty text; cap input to a documented finite limit consistent with backend safety.

Backend request: POST `${PLASMO_PUBLIC_BASE_URL}summarizeDocument`, JSON `{ documentData: string }`, `Content-Type: application/json`, and an optional configured auth header (for example `Authorization: Bearer <value>` or the project’s existing backend contract). Read only `PLASMO_PUBLIC_API_KEY`/equivalent if present; omit the header when absent, never log it, and return `API_ERROR` on non-2xx/malformed response.

### Storage model and invariants
`isOn?: boolean` defaults true; `limit?: number` defaults 0; `chatRoom?: { message: string; sender: "user" | "bot" }[]` defaults empty. The background remains the single writer for toggle/reset/AI writes. Sidepanel performs one `chrome.storage.local.get(["limit", "chatRoom"])` initial read and then applies `storage.onChanged`; listeners are removed on unmount. Queue writes remain serialized.

### Vertical slices
1. Manifest/dead-code cleanup: remove permission and dead files only after reference search; build manifest assertion.
2. Shared contract + background hardening: types, guards, auth seam, safe errors; unit tests for valid/invalid requests and credential behavior.
3. Popup/switch: shared theme, accessible switch, loading/error behavior, typed runtime call; component/build checks.
4. Sidepanel: one read, listener lifecycle, pending/error/empty/limit states, responsive unified layout; tests and static gates.
5. CSS cleanup and production verification: remove unused custom toggle/skeuomorphic rules, run all commands and inspect generated manifest.

### Component states and edge matrix
- Popup: loading, loaded-on, loaded-off, storage failure; controls remain keyboard accessible.
- Sidepanel: loading, empty, populated, pending, API error with retry path, disabled, limit reached, reset success/failure.
- Empty/null input: reject without API call and show safe message.
- Malformed message: reject/no throw.
- Missing API key: omit auth header and show API error on protected backend response.
- Timeout/non-2xx/malformed JSON: API error, no sensitive payload logging.
- Concurrent requests: queue prevents lost limit/history writes.
- 10k history records: render remains bounded or safely scrollable; do not add an unbounded synchronous transformation.
- Offline/service worker unavailable: runtime.lastError handled and input restored or retry remains possible.
- Responsive 300–600px sidepanel: no horizontal overflow; bubbles/actions remain usable.

### Test matrix and executable contracts
- Unit/background: `processAiRequest` rejects blank input, disabled/limit paths, malformed API response, missing credential, and successful storage write; `enqueueWrite` serializes writes.
- Messaging: valid requests map correctly; unknown/malformed requests do not throw; runtime callback errors become UI-safe errors.
- Sidepanel integration/component: one initial storage get contains both keys; storage listener updates history/limit and is removed; pending disables duplicate send; empty/limit/error states render.
- Popup component: storage hydration, switch semantics/ARIA, open-sidepanel failure safety.
- Security: no committed secret; auth header is omitted when unset and never logged; user text is not interpolated into headers or executable HTML.
- Regression/build: existing Vitest suite passes, TypeScript passes, production manifest has no `clipboardRead`, and no debug `console.log` remains in extension source.
- Accessibility/UI: switch exposes `role="switch"`/checked state or Mantine equivalent, visible focus ring, button names, textarea label, and no horizontal overflow at 300px.

Engineer must add named tests (or extend current test files) for each contract above; tests must be deterministic with mocked Chrome APIs and fetch.

### Verification Exit Criteria
- [ ] `pnpm --dir clipboard-extension exec tsc --noEmit` exits 0.
- [ ] `pnpm --dir clipboard-extension test` exits 0 and includes malformed-message, missing-credential, single-read, and switch accessibility cases.
- [ ] `pnpm --dir clipboard-extension build` exits 0 and generated Chrome MV3 manifest contains no `clipboardRead` and no placeholder options page.
- [ ] `rg -n "console\.log|clipboardRead|vmin|IndexOption" clipboard-extension/src clipboard-extension/package.json` returns no matches, except explicitly justified test fixtures.
- [ ] `rg -n "storage\.local\.get" clipboard-extension/src/sidepanel/index.tsx` shows one initial read site and no sequential per-key initial reads.
- [ ] Auth/API-key header is absent when its environment value is unset and present only with the configured value in a mocked fetch test; secret value never appears in logs.
- [ ] Manual/runtime check at 300px sidepanel width shows no horizontal scrollbar, the toggle has visible focus and exposed on/off state, and send/pending/limit/error/empty states are usable.
- [ ] `git diff --check` exits 0 and only intended extension/spec files are modified.

### Verification commands and logs
Run from repository root with `pnpm --dir clipboard-extension ...`; build output is under `clipboard-extension/build/`. Capture compiler/test/build stderr in the Engineer report; do not add runtime debug logging to source.
