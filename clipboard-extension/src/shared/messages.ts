/**
 * Shared discriminated message contracts between content script, popup,
 * sidepanel, and the MV3 service worker. Runtime guards keep every entry
 * point safe against malformed or untrusted messages (never throws).
 */

export type AiRequestError =
	| "DISABLED"
	| "LIMIT_REACHED"
	| "API_ERROR"
	| "INVALID_INPUT"
	| "SERVER_ERROR"
	| "INPUT_TOO_LONG"
	| "SIDEPANEL_ERROR";

export type ExtensionRequest =
	| { type: "TOGGLE_SWITCH"; isOn: boolean }
	| { type: "RESET_HISTORY" }
	| { type: "SELECTED_TEXT"; text: string }
	| { type: "CHAT"; chatMessage: string }
	| {
			type: "AI_ACTION";
			text: string; // RAW source text — background composes the prompt (single source)
			action: "explain" | "summarize";
			requestId: string;
			anchor: { x: number; y: number }; // client (viewport) coords
			source: "selection" | "copy";
	  }
	| { type: "GET_TAB_ID" }
	| { type: "OPEN_SIDEPANEL" };

export type CommandResponse = { success: true };
export type AiRequestResponse =
	| { modifiedText: string; truncated?: boolean }
	| { error: AiRequestError };
export type TabInfoResponse = { tabId: number | null; frameId: number };
export type ExtensionResponse = CommandResponse | AiRequestResponse | TabInfoResponse;

export const MAX_MODEL_INPUT_LENGTH = 24_000;

/** Trim; reject empty/non-string. */
export function validateInput(rawText: unknown): string | null {
	if (typeof rawText !== "string") return null;
	const text = rawText.trim();
	if (text.length === 0) return null;
	return text;
}

/** Clamp oversized text to the model limit. */
export function clampInput(text: string): { text: string; truncated: boolean } {
	if (text.length <= MAX_MODEL_INPUT_LENGTH) return { text, truncated: false };
	return { text: text.slice(0, MAX_MODEL_INPUT_LENGTH), truncated: true };
}

/** Structural guard: returns true only for well-formed extension requests. */
export function isExtensionRequest(value: unknown): value is ExtensionRequest {
	if (typeof value !== "object" || value === null) return false;
	const msg = value as Record<string, unknown>;
	if (typeof msg.type !== "string") return false;

	switch (msg.type) {
		case "TOGGLE_SWITCH":
			return typeof msg.isOn === "boolean";
		case "RESET_HISTORY":
			return true;
		case "SELECTED_TEXT":
			return typeof msg.text === "string";
		case "CHAT":
			return typeof msg.chatMessage === "string";
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
		default:
			return false;
	}
}

/** Response guard used by senders to surface safe errors without throwing. */
export function isAiRequestResponse(value: unknown): value is AiRequestResponse {
	if (typeof value !== "object" || value === null) return false;
	const res = value as Record<string, unknown>;
	if (typeof res.modifiedText === "string") {
		return res.truncated === undefined || typeof res.truncated === "boolean";
	}
	if (
		typeof res.error === "string" &&
		[
			"DISABLED",
			"LIMIT_REACHED",
			"API_ERROR",
			"INVALID_INPUT",
			"SERVER_ERROR",
			"INPUT_TOO_LONG",
		].includes(res.error)
	) {
		return true;
	}
	return false;
}
