import { describe, expect, it } from "vitest";
import type { PopoverRequest, PopoverResult } from "@/shared/messages";
import {
	applyPopoverRequest,
	applyPopoverResult,
	applyPopoverStorageChanges,
	type PopoverState,
	type TabFrameInfo
} from "@/shared/popover";
import { POPOVER_REQUEST_KEY, POPOVER_RESULT_KEY } from "@/shared/popover";

const info: TabFrameInfo = { tabId: 1, frameId: 0 };
const request: PopoverRequest = {
	action: "explain",
	text: "test",
	requestId: "req-1",
	tabId: 1,
	frameId: 0,
	at: Date.now(),
	source: "selection",
	anchor: { x: 0, y: 0 }
};
const resultOk: PopoverResult = {
	ok: true,
	text: "this is a result",
	requestId: "req-1",
	tabId: 1,
	frameId: 0
};
const resultError: PopoverResult = {
	ok: false,
	error: "API_ERROR",
	requestId: "req-1",
	tabId: 1,
	frameId: 0
};

describe("shared/popover state reducers", () => {
	const idleState: PopoverState = { status: "idle" };
	const loadingState: PopoverState = { status: "loading", request };

	// applyPopoverRequest
	it("1. idle + matching request → loading", () => {
		const next = applyPopoverRequest(idleState, request, info);
		expect(next).toEqual({ status: "loading", request });
	});

	it("2. idle + request(other tabId) → idle", () => {
		const otherTabRequest = { ...request, tabId: 2 };
		const next = applyPopoverRequest(idleState, otherTabRequest, info);
		expect(next).toBe(idleState);
	});

	it("3. idle + request(other frameId) → idle", () => {
		const otherFrameRequest = { ...request, frameId: 1 };
		const next = applyPopoverRequest(idleState, otherFrameRequest, info);
		expect(next).toBe(idleState);
	});

	it("11. loading + duplicate request(same requestId) → same reference", () => {
		const next = applyPopoverRequest(loadingState, request, info);
		expect(next).toBe(loadingState);
	});

	// applyPopoverResult
	it("4. loading + result(ok, matching requestId, text, truncated:true) → done{result,truncated:true}", () => {
		const truncatedResult = { ...resultOk, truncated: true };
		const next = applyPopoverResult(loadingState, truncatedResult, info);
		expect(next).toEqual({
			status: "done",
			request,
			result: "this is a result",
			truncated: true
		});
	});

	it("5. loading + result(ok, text empty string) → error{code:'API_ERROR'}", () => {
		const emptyTextResult = { ...resultOk, text: "" };
		const next = applyPopoverResult(loadingState, emptyTextResult, info);
		expect(next).toEqual({ status: "error", request, code: "API_ERROR" });
	});

	it("6. loading + result(!ok, error:'LIMIT_REACHED') → error{code:'LIMIT_REACHED'}", () => {
		const limitErrorResult = { ...resultError, error: "LIMIT_REACHED" };
		const next = applyPopoverResult(loadingState, limitErrorResult, info);
		expect(next).toEqual({ status: "error", request, code: "LIMIT_REACHED" });
	});

	it("8. loading + result(stale requestId from previous request) → stays loading, same reference", () => {
		const staleResult = { ...resultOk, requestId: "req-0" };
		const next = applyPopoverResult(loadingState, staleResult, info);
		expect(next).toBe(loadingState);
	});

	it("9. idle + result only (no request) → idle, same reference", () => {
		const next = applyPopoverResult(idleState, resultOk, info);
		expect(next).toBe(idleState);
	});

	it("10. done + result(duplicate) → same reference (results only resolve loading)", () => {
		const doneState: PopoverState = {
			status: "done",
			request,
			result: "already done",
			truncated: false
		};
		const next = applyPopoverResult(doneState, resultOk, info);
		expect(next).toBe(doneState);
	});

	it("12. loading + result(ok) but tabId mismatch → stays loading", () => {
		const otherTabResult = { ...resultOk, tabId: 2 };
		const next = applyPopoverResult(loadingState, otherTabResult, info);
		expect(next).toBe(loadingState);
	});

	// applyPopoverStorageChanges
	it("7. idle + {request AND result} same changes object → done", () => {
		const changes = {
			[POPOVER_REQUEST_KEY]: { newValue: request },
			[POPOVER_RESULT_KEY]: { newValue: resultOk }
		};
		const next = applyPopoverStorageChanges(idleState, changes, info);
		expect(next).toEqual({
			status: "done",
			request,
			result: "this is a result",
			truncated: false // or undefined, check your type
		});
	});
});
