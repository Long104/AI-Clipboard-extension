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