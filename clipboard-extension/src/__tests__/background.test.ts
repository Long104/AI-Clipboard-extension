import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ChatMessage } from "../background";
import {
	buildTranslateEndpoint,
	enqueueWrite,
	fetchTranslate,
	handleAlarm,
	handleCommand,
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
	messageListeners: [] as Array<(message: any, sender: any, sendResponse: any) => void>,
	commandListeners: [] as Array<(command: string) => void>,
};

function resetTestState() {
	testState.storage = {};
	testState.storageListeners = [];
	testState.messageListeners = [];
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
			addListener: (listener: (message: any, sender: any, sendResponse: any) => void) => {
				testState.messageListeners.push(listener);
			},
		},
	},
	windows: {
		getLastFocused: vi.fn().mockResolvedValue({ id: 1 }),
	},
	sidePanel: {
		open: vi.fn().mockResolvedValue(undefined),
	},
	tabs: {
		query: vi.fn().mockResolvedValue([]),
	},
	commands: {
		onCommand: {
			addListener: (listener: (command: string) => void) => {
				testState.commandListeners.push(listener);
			},
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

	it("fetchTranslate coerces numeric response (math answer) to string", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({ message: { response: 4 } }),
			})
		);

		const promise = fetchTranslate("what is 2+2");
		await vi.runAllTimersAsync();
		const result = await promise;
		expect(result).toEqual({ ok: true, text: "4" });
	});

	it("fetchTranslate coerces boolean response to string", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({ message: { response: true } }),
			})
		);

		const promise = fetchTranslate("test");
		await vi.runAllTimersAsync();
		const result = await promise;
		expect(result).toEqual({ ok: true, text: "true" });
	});

	it("fetchTranslate passes string response through unchanged", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({ message: { response: "hello world" } }),
			})
		);

		const promise = fetchTranslate("test");
		await vi.runAllTimersAsync();
		const result = await promise;
		expect(result).toEqual({ ok: true, text: "hello world" });
	});

	it("fetchTranslate rejects null response", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({ message: { response: null } }),
			})
		);

		const promise = fetchTranslate("test");
		await vi.runAllTimersAsync();
		const result = await promise;
		expect(result).toEqual({ ok: false, code: "SERVER_ERROR" });
	});

	it("fetchTranslate rejects missing response field", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({ message: {} }),
			})
		);

		const promise = fetchTranslate("test");
		await vi.runAllTimersAsync();
		const result = await promise;
		expect(result).toEqual({ ok: false, code: "SERVER_ERROR" });
	});

	it("fetchTranslate sends X-Extension-Key header when BYO key provided", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({ message: { response: "ok" } }),
			})
		);

		await fetchTranslate("test", "sk-byo-key");
		expect(fetch).toHaveBeenCalledWith(
			expect.any(String),
			expect.objectContaining({
				headers: expect.objectContaining({ "X-Extension-Key": "sk-byo-key" }),
			})
		);
	});

	it("fetchTranslate omits X-Extension-Key header when no BYO key", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({ message: { response: "ok" } }),
			})
		);

		await fetchTranslate("test");
		expect(fetch).toHaveBeenCalledWith(
			expect.any(String),
			expect.not.objectContaining({
				headers: expect.objectContaining({ "X-Extension-Key": expect.any(String) }),
			})
		);
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

describe("background BYO mode", () => {
	beforeEach(() => {
		resetTestState();
		vi.stubGlobal("chrome", mockChrome);
		vi.stubGlobal("fetch", vi.fn());
	});

	it("BYO mode unlimited requests even at limit", async () => {
		testState.storage = {
			settings: {
				usageMode: "byo",
				apiKey: "sk-test",
				overlayEnabled: true,
				captureOnCopy: true,
			},
			limit: 10,
		};
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({ message: { response: "translated" } }),
			})
		);

		const result = await processAiRequest("hello");
		expect(result).toEqual({ modifiedText: "translated" });
		expect(testState.storage.limit).toBe(10);
		expect(testState.storage.chatRoom.length).toBe(2);
	});

	it("BYO mode with blank key falls back to free limit", async () => {
		testState.storage = {
			settings: {
				usageMode: "byo",
				apiKey: "   ",
				overlayEnabled: true,
				captureOnCopy: true,
			},
			limit: 10,
		};
		const result = await processAiRequest("hello");
		expect(result).toEqual({ error: "LIMIT_REACHED" });
	});
});

describe("background commands", () => {
	beforeEach(() => {
		resetTestState();
		vi.stubGlobal("chrome", mockChrome);
	});

	it("handleCommand toggle-sidepanel opens panel with tabId", async () => {
		const opener = vi.fn();
		const mockTabs = [
			{ id: 7, index: 0, windowId: 7, selected: true, url: "https://example.com", title: "test" },
		];
		const mockWindows = {
			...mockChrome,
			tabs: {
				query: vi.fn().mockResolvedValue(mockTabs),
			},
			windows: {
				getLastFocused: vi.fn().mockResolvedValue({ id: 7 }),
			},
		};
		vi.stubGlobal("chrome", mockWindows);
		
		await handleCommand("toggle-sidepanel", opener);
		expect(opener).toHaveBeenCalledWith({ tabId: 7 });
	});

	it("handleCommand toggle-sidepanel opens panel with windowId when no active tab", async () => {
		const opener = vi.fn();
		const mockTabs = [];
		const mockWindows = {
			...mockChrome,
			tabs: {
				query: vi.fn().mockResolvedValue(mockTabs),
			},
			windows: {
				getLastFocused: vi.fn().mockResolvedValue({ id: 7 }),
			},
		};
		vi.stubGlobal("chrome", mockWindows);
		
		await handleCommand("toggle-sidepanel", opener);
		expect(opener).toHaveBeenCalledWith({ windowId: 7 });
	});
});

describe("background commands.onCommand listener", () => {
	beforeEach(() => {
		resetTestState();
		vi.stubGlobal("chrome", mockChrome);
		vi.stubGlobal("fetch", vi.fn());
		vi.mocked(mockChrome.sidePanel.open).mockClear();
		vi.mocked(mockChrome.tabs.query).mockReset().mockResolvedValue([]);
		vi.resetModules();
	});

	it("registers onCommand listener and opens sidepanel via tabId", async () => {
		await import("../background");
		const listener = testState.commandListeners[0];
		expect(listener).toBeDefined();

		vi.mocked(mockChrome.tabs.query).mockResolvedValue([{ id: 33 }] as any);
		await listener("toggle-sidepanel");

		expect(mockChrome.tabs.query).toHaveBeenCalledWith({
			active: true,
			currentWindow: true,
		});
		expect(mockChrome.sidePanel.open).toHaveBeenCalledWith({ tabId: 33 });
	});

	it("ignores unknown commands via onCommand listener", async () => {
		await import("../background");
		const listener = testState.commandListeners[0];

		await listener("other-command");
		expect(mockChrome.sidePanel.open).not.toHaveBeenCalled();
	});
});

describe("background AI message relay", () => {
	beforeEach(() => {
		resetTestState();
		vi.stubGlobal("chrome", mockChrome);
		vi.stubGlobal("fetch", vi.fn());
		// Force re-evaluation to register listener with stubbed chrome
		vi.resetModules();
	});

	it("AI_ACTION success writes popoverRequest and result", async () => {
		const { processAiRequest: _ } = await import("../background");
		const listener = testState.messageListeners[0];
		
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({ message: { response: "translated" } }),
			})
		);

		const sender = { tab: { id: 42 }, frameId: 7 };
		const responsePromise = new Promise((resolve) => {
			listener({
				type: "AI_ACTION",
				text: "raw",
				action: "explain",
				requestId: "rid-1",
				anchor: { x: 1, y: 2 },
				source: "selection"
			}, sender, resolve);
		});

		const response = await responsePromise;
		expect(response).toEqual({ modifiedText: "translated" });
		expect(testState.storage.popoverRequest).toMatchObject({ requestId: "rid-1", text: "raw" });
		expect(testState.storage.popoverResult).toMatchObject({ ok: true, text: "translated" });
	});

	it("AI_ACTION failing fetch writes popoverResult error", async () => {
		const { processAiRequest: _ } = await import("../background");
		const listener = testState.messageListeners[0];
		
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));
		vi.useFakeTimers();

		const sender = { tab: { id: 42 }, frameId: 7 };
		const responsePromise = new Promise((resolve) => {
			listener({
				type: "AI_ACTION",
				text: "raw",
				action: "explain",
				requestId: "rid-1",
				anchor: { x: 1, y: 2 },
				source: "selection"
			}, sender, resolve);
		});

		await vi.runAllTimersAsync();
		const response = await responsePromise;
		expect(response).toEqual({ error: "SERVER_ERROR" });
		expect(testState.storage.popoverResult).toMatchObject({ ok: false, error: "SERVER_ERROR" });
		vi.useRealTimers();
	});

	it("GET_TAB_ID responds tabId/frameId", async () => {
		const { processAiRequest: _ } = await import("../background");
		const listener = testState.messageListeners[0];
		const sender = { tab: { id: 42 }, frameId: 7 };
		
		const response = await new Promise((resolve) => {
			listener({ type: "GET_TAB_ID" }, sender, resolve);
		});
		expect(response).toEqual({ tabId: 42, frameId: 7 });
	});

	it("OPEN_SIDEPANEL responds success", async () => {
		const { processAiRequest: _ } = await import("../background");
		const listener = testState.messageListeners[0];
		
		const response = await new Promise((resolve) => {
			listener({ type: "OPEN_SIDEPANEL" }, { tab: { id: 99 }, frameId: 1 }, resolve);
		});
		expect(response).toEqual({ success: true });
		expect(mockChrome.sidePanel.open).toHaveBeenCalledWith({ tabId: 99 });
	});

	it("OPEN_SIDEPANEL responds success with windowId when tabId not available", async () => {
		const { processAiRequest: _ } = await import("../background");
		const listener = testState.messageListeners[0];
		
		// Mock windows.getLastFocused
		vi.mocked(mockChrome.windows.getLastFocused).mockResolvedValueOnce({ id: 42 });
		
		const response = await new Promise((resolve) => {
			listener({ type: "OPEN_SIDEPANEL" }, {}, resolve);
		});
		expect(response).toEqual({ success: true });
		expect(mockChrome.sidePanel.open).toHaveBeenCalledWith({ windowId: 42 });
	});

	it("AI_ACTION empty text writes nothing", async () => {
		const { processAiRequest: _ } = await import("../background");
		const listener = testState.messageListeners[0];
		
		const response = await new Promise((resolve) => {
			listener({
				type: "AI_ACTION",
				text: "   ",
				action: "explain",
				requestId: "rid-1",
				anchor: { x: 1, y: 2 },
				source: "selection"
			}, {}, resolve);
		});
		expect(response).toEqual({ error: "INVALID_INPUT" });
		expect(testState.storage.popoverRequest).toBeUndefined();
	});
});

