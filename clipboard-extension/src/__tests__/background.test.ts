import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ChatMessage } from "../background";
import {
	buildTranslateEndpoint,
	enqueueWrite,
	fetchTranslate,
	handleAlarm,
	MAX_USAGE_LIMIT,
	processAiRequest,
	setupAlarms,
} from "../background";

// ---------------------------------------------------------------------------
// Mock implementation of chrome global
// ---------------------------------------------------------------------------

const testState = {
	storage: {} as Record<string, any>,
	storageListeners: [] as Array<(changes: any, area: string) => void>,
};

function resetTestState() {
	testState.storage = {};
	testState.storageListeners = [];
}

const mockChrome = {
	storage: {
		local: {
			get: (keys: string | string[], callback: (data: any) => void) => {
				const keyList = typeof keys === "string" ? [keys] : keys;
				const result: Record<string, any> = {};
				for (const key of keyList) {
					if (key in testState.storage) {
						result[key] = testState.storage[key];
					}
				}
				callback(result);
			},
			set: (data: Record<string, any>, callback?: () => void) => {
				Object.assign(testState.storage, data);
				for (const listener of testState.storageListeners) {
					listener({ ...data }, "local");
				}
				if (callback) callback();
			},
		},
		onChanged: {
			addListener: (listener: (changes: any, area: string) => void) => {
				testState.storageListeners.push(listener);
			},
			removeListener: (listener: (changes: any, area: string) => void) => {
				const idx = testState.storageListeners.indexOf(listener);
				if (idx !== -1) testState.storageListeners.splice(idx, 1);
			},
		},
	},
	alarms: {
		get: (name: string, callback: (alarm: any) => void) => {
			callback(testState.storage[name] ?? null);
		},
		create: (name: string, alarmInfo: any) => {
			testState.storage[name] = { name, ...alarmInfo };
		},
		onAlarm: {
			addListener: () => {},
		},
	},
	runtime: {
		onMessage: {
			addListener: () => {},
		},
	},
	action: {
		setBadgeText: vi.fn(),
		setBadgeBackgroundColor: vi.fn(),
	},
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("background translation logic", () => {
	beforeEach(() => {
		resetTestState();
		vi.stubGlobal("chrome", mockChrome);
		vi.stubGlobal("fetch", vi.fn());
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("buildTranslateEndpoint normalizes trailing slash", () => {
		const expected =
			"https://clipboard-backend.aieasyuse.workers.dev/summarizeDocument";
		expect(
			buildTranslateEndpoint(
				"https://clipboard-backend.aieasyuse.workers.dev"
			)
		).toBe(expected);
		expect(
			buildTranslateEndpoint(
				"https://clipboard-backend.aieasyuse.workers.dev/"
			)
		).toBe(expected);
		expect(
			buildTranslateEndpoint(
				"https://clipboard-backend.aieasyuse.workers.dev///"
			)
		).toBe(expected);
	});

	it("fetchTranslate retries on 500 error", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn()
				.mockResolvedValueOnce({ ok: false, status: 500 })
				.mockResolvedValueOnce({
					ok: true,
					json: () => Promise.resolve({ message: { response: "success" } }),
				})
		);

		const promise = fetchTranslate("hello");
		await vi.runAllTimersAsync();
		const result = await promise;
		expect(fetch).toHaveBeenCalledTimes(2);
		expect(result).toEqual({ ok: true, text: "success" });
	});

	it("fetchTranslate fails after retries", async () => {
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503 }));

		const promise = fetchTranslate("hello");
		await vi.runAllTimersAsync();
		const result = await promise;
		expect(fetch).toHaveBeenCalledTimes(3);
		expect(result).toEqual({ ok: false, code: "SERVER_ERROR" });
	});
});

describe("background badge feedback", () => {
	beforeEach(() => {
		resetTestState();
		vi.stubGlobal("chrome", mockChrome);
		vi.stubGlobal("fetch", vi.fn());
		vi.useFakeTimers();
		vi.mocked(chrome.action.setBadgeText).mockClear();
		vi.mocked(chrome.action.setBadgeBackgroundColor).mockClear();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("badge shows AI then ✓ and clears on success", async () => {
		testState.storage = { isOn: true, limit: 0 };
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({ message: { response: "translated" } }),
			})
		);

		const promise = processAiRequest("hello");
		await promise;
		expect(chrome.action.setBadgeText).toHaveBeenNthCalledWith(1, { text: "AI" });
		expect(chrome.action.setBadgeText).toHaveBeenNthCalledWith(2, { text: "✓" });
		expect(chrome.action.setBadgeBackgroundColor).toHaveBeenLastCalledWith({ color: "#2f9e44" });

		vi.advanceTimersByTime(2000);
		expect(chrome.action.setBadgeText).toHaveBeenNthCalledWith(3, { text: "" });
	});

	it("badge shows ! and clears on API error", async () => {
		testState.storage = { isOn: true, limit: 0 };
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 400 }));

		await processAiRequest("hello");
		expect(chrome.action.setBadgeText).toHaveBeenNthCalledWith(2, { text: "!" });
		expect(chrome.action.setBadgeBackgroundColor).toHaveBeenLastCalledWith({ color: "#e03131" });

		vi.advanceTimersByTime(2000);
		expect(chrome.action.setBadgeText).toHaveBeenNthCalledWith(3, { text: "" });
	});

	it("badge shows ! on limit reached without fetching", async () => {
		testState.storage = { isOn: true, limit: 10 };
		await processAiRequest("hello");
		expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: "!" });
		expect(fetch).not.toHaveBeenCalled();
		vi.advanceTimersByTime(2000);
		expect(chrome.action.setBadgeText).toHaveBeenNthCalledWith(2, { text: "" });
	});

	it("no badge on blank input", async () => {
		await processAiRequest("   ");
		expect(chrome.action.setBadgeText).not.toHaveBeenCalled();
	});

	it("no badge when extension disabled", async () => {
		testState.storage = { isOn: false };
		await processAiRequest("hello");
		expect(chrome.action.setBadgeText).not.toHaveBeenCalled();
	});
});

describe("background MV3 state management", () => {
	beforeEach(() => {
		resetTestState();
		vi.stubGlobal("chrome", mockChrome);
		vi.stubGlobal("fetch", vi.fn());
	});

	it("background rejects blank input", async () => {
		const result = await processAiRequest("");
		if ("error" in result) {
			expect(result.error).toBe("INVALID_INPUT");
		} else {
			throw new Error("Expected error, got modifiedText");
		}
	});

	it("omits Authorization header when API key is missing", async () => {
		process.env.PLASMO_PUBLIC_API_KEY = "";
		const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ message: { response: "ok" } }) });
		vi.stubGlobal("fetch", mockFetch);
		await processAiRequest("test");
		expect(mockFetch).toHaveBeenCalledWith(expect.any(String), expect.not.objectContaining({
			headers: expect.objectContaining({ Authorization: expect.any(String) })
		}));
	});

	it("includes Authorization header when API key is present", async () => {
		process.env.PLASMO_PUBLIC_API_KEY = "test-key";
		const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ message: { response: "ok" } }) });
		vi.stubGlobal("fetch", mockFetch);
		await processAiRequest("test");
		expect(mockFetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
			headers: expect.objectContaining({ Authorization: "Bearer test-key" })
		}));
	});


	it("background appends one user/bot pair on success", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({ message: { response: "translated" } }),
			})
		);

		const result = await processAiRequest("hello world");
		if ("modifiedText" in result) {
			expect(result.modifiedText).toBe("translated");
		} else {
			throw new Error("Expected modifiedText, got error");
		}
		expect(testState.storage.limit).toBe(1);
		expect(testState.storage.chatRoom).toEqual([
			{ message: "hello world", sender: "user" },
			{ message: "translated", sender: "bot" },
		]);
	});

	it("background does not mutate history on API failure", async () => {
		testState.storage = {
			limit: 2,
			chatRoom: [{ message: "existing", sender: "user" }],
		};
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: false,
				status: 500,
			})
		);

		const result = await processAiRequest("test");
		if ("error" in result) {
			expect(result.error).toBe("SERVER_ERROR");
		} else {
			throw new Error("Expected error, got modifiedText");
		}
		expect(testState.storage.limit).toBe(2);
		expect(testState.storage.chatRoom).toEqual([
			{ message: "existing", sender: "user" },
		]);
	});

	it("enqueueWrite serializes concurrent appends", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({ message: { response: "resp" } }),
			})
		);

		await Promise.all([
			processAiRequest("text1"),
			processAiRequest("text2"),
		]);

		expect(testState.storage.limit).toBe(2);
		expect(testState.storage.chatRoom.length).toBe(4);
	});

	it("handleAlarm resets limit to 0", async () => {
		testState.storage = { limit: 5 };
		handleAlarm({ name: "RESET_LIMIT_ALARM" } as chrome.alarms.Alarm);
		// Need to wait for the enqueueWrite task
		await new Promise((resolve) => setTimeout(resolve, 10));
		expect(testState.storage.limit).toBe(0);
	});
});

