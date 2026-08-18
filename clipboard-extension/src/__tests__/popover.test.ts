import { describe, expect, it, vi } from "vitest";
import {
	buildRequestId,
	composePrompt,
	POPOVER_REQUEST_KEY,
	POPOVER_RESULT_KEY,
	triggerAiAction,
} from "../shared/popover";

describe("shared/popover", () => {
	it("composePrompt prefixes text correctly", () => {
		expect(composePrompt("explain", "test text")).toBe(
			`Explain the following text:

test text`
		);
		expect(composePrompt("summarize", "another one")).toBe(
			`Summarize the following text:

another one`
		);
	});

	it("buildRequestId generates unique, non-empty IDs", () => {
		const id1 = buildRequestId();
		const id2 = buildRequestId();
		expect(id1).not.toBe("");
		expect(id2).not.toBe("");
		expect(id1).not.toEqual(id2);
	});

	it("triggerAiAction sends AI_ACTION with raw text", () => {
		const mockSendMessage = vi.fn();
		(global as any).chrome = { runtime: { sendMessage: mockSendMessage } };

		triggerAiAction({
			action: "explain",
			text: "raw text here",
			anchor: { x: 100, y: 200 },
			source: "selection",
		});

		expect(mockSendMessage).toHaveBeenCalledTimes(1);
		const message = mockSendMessage.mock.calls[0][0];
		expect(message.type).toBe("AI_ACTION");
		expect(message.text).toBe("raw text here"); // no composition
		expect(message.action).toBe("explain");
		expect(message.anchor).toEqual({ x: 100, y: 200 });
		expect(message.source).toBe("selection");
		expect(message.requestId).not.toBe("");
	});

	it("exports correct storage key constants", () => {
		expect(POPOVER_REQUEST_KEY).toBe("popoverRequest");
		expect(POPOVER_RESULT_KEY).toBe("popoverResult");
	});
});
