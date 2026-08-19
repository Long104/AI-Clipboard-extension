import type { AiRequestError, ExtensionRequest } from "./messages";

export const POPOVER_REQUEST_KEY = "popoverRequest";
export const POPOVER_RESULT_KEY = "popoverResult";

export type PopoverAction = "explain" | "summarize";
export type PopoverAnchor = { x: number; y: number };

export type PopoverRequest = {
	requestId: string;
	tabId: number | null;
	frameId: number;
	action: PopoverAction;
	anchor: PopoverAnchor;
	source: "selection" | "copy";
	text: string; // RAW source text (not prompt-composed) — powers Retry
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

// --- REDUCER STATE ---
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

// --- ORIGINAL EXPORTS ---
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

/** Fire an AI action: background relays popoverRequest and later popoverResult. */
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
