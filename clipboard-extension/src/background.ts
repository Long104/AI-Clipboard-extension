export {}; // Avoid polluting the global namespace

export interface ChatMessage {
	message: string;
	sender: "user" | "bot";
}

export interface TranslationResponse {
	message: { response: string };
}

export const ALARM_NAME = "RESET_LIMIT_ALARM";
export const ALARM_INTERVAL_MINUTES = 120; // 2 hours
export const MAX_USAGE_LIMIT = 10;

const BADGE_CLEAR_MS = 2000;
let badgeClearTimer: ReturnType<typeof setTimeout> | undefined;

function setBadge(text: string, color: string): void {
	if (typeof chrome !== "undefined" && chrome.action?.setBadgeText) {
		chrome.action.setBadgeText({ text });
		chrome.action.setBadgeBackgroundColor({ color });
	}
}

function clearBadgeAfter(ms: number): void {
	if (badgeClearTimer) clearTimeout(badgeClearTimer);
	badgeClearTimer = setTimeout(() => setBadge("", "#000000"), ms);
}

let enqueueChain: Promise<any> = Promise.resolve();

export function enqueueWrite<T>(task: () => Promise<T>): Promise<T> {
	const res = enqueueChain.then(() => task(), () => task());
	enqueueChain = res.catch(() => {});
	return res;
}

export function setupAlarms(): void {
	if (typeof chrome !== "undefined" && chrome.alarms) {
		chrome.alarms.get(ALARM_NAME, (alarm) => {
			if (!alarm) {
				chrome.alarms.create(ALARM_NAME, {
					periodInMinutes: ALARM_INTERVAL_MINUTES,
				});
			}
		});
	}
}

export function handleAlarm(alarm: chrome.alarms.Alarm): void {
	if (alarm.name === ALARM_NAME) {
		enqueueWrite(async () => {
			await new Promise<void>((resolve) => {
				chrome.storage.local.set({ limit: 0 }, resolve);
			});
		});
	}
}

if (typeof chrome !== "undefined" && chrome.alarms) {
	chrome.alarms.onAlarm.addListener(handleAlarm);
	setupAlarms();
}

async function fetchTranslate(messageText: string): Promise<string | undefined> {
	const baseUrl = process.env.PLASMO_PUBLIC_BASE_URL || "";
	try {
		const res = await fetch(`${baseUrl}summarizeDocument`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				documentData: messageText,
			}),
		});

		if (res.ok) {
			const data = await res.json();
			return data?.message?.response;
		}
	} catch (err) {
		console.error("Translation API error", err instanceof Error ? err.message : String(err));
	}
	return undefined;
}

export async function processAiRequest(inputText: string): Promise<{ modifiedText?: string; error?: "DISABLED" | "LIMIT_REACHED" | "API_ERROR" | "INVALID_INPUT" }> {
	const text = inputText ? inputText.trim() : "";
	if (!text) {
		return { error: "INVALID_INPUT" };
	}

	return enqueueWrite(async () => {
		const storageData = await new Promise<{ isOn?: boolean; limit?: number }>((resolve) => {
			chrome.storage.local.get(["isOn", "limit"], resolve);
		});

		const isOn = storageData.isOn ?? true;
		const limit = storageData.limit || 0;

		if (!isOn) {
			return { error: "DISABLED" };
		}

		if (limit >= MAX_USAGE_LIMIT) {
			setBadge("!", "#e03131");
			clearBadgeAfter(BADGE_CLEAR_MS);
			return { error: "LIMIT_REACHED" };
		}

		setBadge("AI", "#5c5f66");
		const translatedText = await fetchTranslate(text);
		if (!translatedText) {
			setBadge("!", "#e03131");
			clearBadgeAfter(BADGE_CLEAR_MS);
			return { error: "API_ERROR" };
		}

		const data = await new Promise<{ chatRoom?: ChatMessage[] }>((resolve) => {
			chrome.storage.local.get(["chatRoom"], resolve);
		});

		const currentHistory = data.chatRoom || [];
		const updatedHistory: ChatMessage[] = [
			...currentHistory,
			{ message: text, sender: "user" },
			{ message: translatedText, sender: "bot" },
		];
		const updatedLimit = limit + 1;

		await new Promise<void>((resolve) => {
			chrome.storage.local.set(
				{
					chatRoom: updatedHistory,
					limit: updatedLimit,
				},
				resolve,
			);
		});

		setBadge("✓", "#2f9e44");
		clearBadgeAfter(BADGE_CLEAR_MS);
		return { modifiedText: translatedText };
	});
}

if (typeof chrome !== "undefined" && chrome.runtime?.onMessage) {
	chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
		if (message.type === "TOGGLE_SWITCH") {
			const newState = Boolean(message.isOn);
			enqueueWrite(async () => {
				await new Promise<void>((resolve) => {
					chrome.storage.local.set({ isOn: newState }, resolve);
				});
			});
			sendResponse({ success: true });
			return false;
		}

		if (message.type === "RESET_HISTORY") {
			enqueueWrite(async () => {
				await new Promise<void>((resolve) => {
					chrome.storage.local.set({ chatRoom: [] }, resolve);
				});
			});
			sendResponse({ success: true });
			return false;
		}

		if (message.type === "SELECTED_TEXT" || message.type === "CHAT") {
			const rawText = message.type === "SELECTED_TEXT" ? message.text : message.chatMessage;
			processAiRequest(rawText)
				.then((result) => sendResponse(result))
				.catch((err) => {
					console.error("Unhandled error processing request", err instanceof Error ? err.message : String(err));
					sendResponse({ error: "API_ERROR" });
				});
			return true; // Keep channel open for async response
		}
	});
}
