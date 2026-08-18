import { describe, expect, it, vi } from "vitest";
import {
	isExtensionRequest,
	validateInput,
	clampInput,
	isAiRequestResponse,
	MAX_MODEL_INPUT_LENGTH,
} from "../shared/messages";
import { loadInitialSidepanelState } from "../shared/storage";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Switch } from "../components/ui/switch";

describe("shared contracts", () => {
	it("isExtensionRequest rejects malformed messages without throwing", () => {
		expect(isExtensionRequest({ type: "UNKNOWN" })).toBe(false);
		expect(isExtensionRequest({ type: "TOGGLE_SWITCH" })).toBe(false); // missing isOn
		expect(isExtensionRequest({ type: "SELECTED_TEXT", text: 123 })).toBe(false);
	});

	it("isExtensionRequest validates AI_ACTION contract", () => {
		expect(isExtensionRequest({
			type: "AI_ACTION",
			text: "hello",
			action: "explain",
			requestId: "r1",
			anchor: { x: 10, y: 20 },
			source: "selection"
		})).toBe(true);
		expect(isExtensionRequest({ type: "AI_ACTION", text: "x", action: "summarize", requestId: "r1", anchor: { x: 1, y: 1 }, source: "copy" })).toBe(true);
		expect(isExtensionRequest({ type: "AI_ACTION", text: "x", action: "invalid", requestId: "r1", anchor: { x: 1, y: 1 }, source: "copy" })).toBe(false);
		expect(isExtensionRequest({ type: "AI_ACTION", text: "x", action: "explain", requestId: "", anchor: { x: 1, y: 1 }, source: "copy" })).toBe(false);
		expect(isExtensionRequest({ type: "AI_ACTION", text: 123, action: "explain", requestId: "r1", anchor: { x: 1, y: 1 }, source: "copy" })).toBe(false);
		expect(isExtensionRequest({ type: "AI_ACTION", text: "x", action: "explain", requestId: "r1", anchor: { x: NaN, y: 1 }, source: "copy" })).toBe(false);
		expect(isExtensionRequest({ type: "AI_ACTION", text: "x", action: "explain", requestId: "r1", anchor: { x: 1, y: Infinity }, source: "copy" })).toBe(false);
		expect(isExtensionRequest({ type: "AI_ACTION", text: "x", action: "explain", requestId: "r1", anchor: null, source: "copy" })).toBe(false);
	});

	it("isExtensionRequest validates GET_TAB_ID and OPEN_SIDEPANEL", () => {
		expect(isExtensionRequest({ type: "GET_TAB_ID" })).toBe(true);
		expect(isExtensionRequest({ type: "OPEN_SIDEPANEL" })).toBe(true);
		expect(isExtensionRequest({ type: "UNKNOWN" })).toBe(false);
	});

	it("validateInput trims and rejects empty/non-string", () => {
		expect(validateInput("hello")).toBe("hello");
		expect(validateInput("  hello  ")).toBe("hello");
		expect(validateInput("")).toBe(null);
		expect(validateInput("   ")).toBe(null);
		expect(validateInput(123)).toBe(null);
	});

	it("clampInput leaves short text untouched", () => {
		expect(clampInput("hello")).toEqual({ text: "hello", truncated: false });
	});

	it("clampInput truncates text beyond the model limit", () => {
		const long = "x".repeat(MAX_MODEL_INPUT_LENGTH + 500);
		const result = clampInput(long);
		expect(result.truncated).toBe(true);
		expect(result.text.length).toBe(MAX_MODEL_INPUT_LENGTH);
	});

	it("isAiRequestResponse accepts new error codes and truncated flag", () => {
		expect(isAiRequestResponse({ error: "SERVER_ERROR" })).toBe(true);
		expect(isAiRequestResponse({ error: "INPUT_TOO_LONG" })).toBe(true);
		expect(isAiRequestResponse({ modifiedText: "ok", truncated: true })).toBe(true);
		expect(isAiRequestResponse({ modifiedText: "ok" })).toBe(true);
		expect(isAiRequestResponse({ error: "UNKNOWN" })).toBe(false);
	});

	it("loadInitialSidepanelState calls storage.local.get once with both keys", async () => {
		const mockGet = vi.fn((keys, cb) => cb({ limit: 1, chatRoom: [] }));
		(global as any).chrome = { storage: { local: { get: mockGet } } };
		await loadInitialSidepanelState();
		expect(mockGet).toHaveBeenCalledTimes(1);
		expect(mockGet).toHaveBeenCalledWith(["limit", "chatRoom"], expect.any(Function));
	});
});

describe("accessibility", () => {
	it("Switch exposes role=switch", () => {
		const html = renderToStaticMarkup(
			createElement(Switch, { checked: true, onCheckedChange: () => {}, "aria-label": "Toggle" })
		);
		expect(html).toContain('role="switch"');
		expect(html).toContain('type="checkbox"');
	});
});
