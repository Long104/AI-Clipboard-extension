import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ChatMessage } from "../background";
import {
	enqueueWrite,
	MAX_USAGE_LIMIT,
	processAiRequest,
	setupAlarms,
	handleAlarm,
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
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("background MV3 state management", () => {
	beforeEach(() => {
		resetTestState();
		vi.stubGlobal("chrome", mockChrome);
		vi.stubGlobal("fetch", vi.fn());
	});

	it("background rejects blank input", async () => {
		const result = await processAiRequest("");
		expect(result.error).toBe("INVALID_INPUT");
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
		expect(result.modifiedText).toBe("translated");
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
		expect(result.error).toBe("API_ERROR");
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
