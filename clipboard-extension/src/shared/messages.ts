/**
 * Shared discriminated message contracts between content script, popup,
 * sidepanel, and the MV3 service worker. Runtime guards keep every entry
 * point safe against malformed or untrusted messages (never throws).
 */

export type AiRequestError = "DISABLED" | "LIMIT_REACHED" | "API_ERROR" | "INVALID_INPUT";

export type ExtensionRequest =
	| { type: "TOGGLE_SWITCH"; isOn: boolean }
	| { type: "RESET_HISTORY" }
	| { type: "SELECTED_TEXT"; text: string }
	| { type: "CHAT"; chatMessage: string };

export type CommandResponse = { success: true };
export type AiRequestResponse =
	| { modifiedText: string }
	| { error: AiRequestError };
export type ExtensionResponse = CommandResponse | AiRequestResponse;

/** Longest accepted user text; protects the backend and storage from abuse. */
export const MAX_INPUT_LENGTH = 10_000;

/** Trim and reject empty/oversized input deterministically without a network call. */
export function validateInput(rawText: unknown): string | null {
	if (typeof rawText !== "string") return null;
	const text = rawText.trim();
	if (text.length === 0 || text.length > MAX_INPUT_LENGTH) return null;
	return text;
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
		default:
			return false;
	}
}

/** Response guard used by senders to surface safe errors without throwing. */
export function isAiRequestResponse(value: unknown): value is AiRequestResponse {
	if (typeof value !== "object" || value === null) return false;
	const res = value as Record<string, unknown>;
	if (typeof res.modifiedText === "string") return true;
	if (
		typeof res.error === "string" &&
		["DISABLED", "LIMIT_REACHED", "API_ERROR", "INVALID_INPUT"].includes(res.error)
	) {
		return true;
	}
	return false;
}
