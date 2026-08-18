import type {
	AiRequestError,
	AiRequestResponse,
	ExtensionRequest,
	ExtensionResponse,
} from "./shared/messages";
import { isExtensionRequest, MAX_INPUT_LENGTH, validateInput } from "./shared/messages";

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

/**
 * Backend request seam: optional API key sourced from the environment at build
 * time. The header is omitted when the key is absent (never an empty/accidental
 * credential) and the value is never logged.
 */
async function fetchTranslate(messageText: string): Promise<string | undefined> {
	const baseUrl = process.env.PLASMO_PUBLIC_BASE_URL || "";
	const apiKey = process.env.PLASMO_PUBLIC_API_KEY || "";
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
	};
	if (apiKey) {
		headers["Authorization"] = `Bearer ${apiKey}`;
	}
	try {
		const res = await fetch(`${baseUrl}summarizeDocument`, {
			method: "POST",
			headers,
			body: JSON.stringify({
				documentData: messageText,
			}),
		});

		if (res.ok) {
			const data = await res.json();
			if (typeof data?.message?.response === "string") {
				return data.message.response;
			}
			// Malformed successful response → structured error, no payload logged.
			console.error("Malformed API response", { status: res.status });
			return undefined;
		}
	} catch (err) {
		console.error("Translation API error", err instanceof Error ? err.message : String(err));
	}
	return undefined;
}

export async function processAiRequest(
	inputText: string
): Promise<AiRequestResponse> {
	const text = validateInput(inputText);
	if (text === null) {
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

function sendSafeResponse(sendResponse: (response: ExtensionResponse) => void): void {
	sendResponse({ error: "API_ERROR" });
}

if (typeof chrome !== "undefined" && chrome.runtime?.onMessage) {
	chrome.runtime.onMessage.addListener(
		(
			message: unknown,
			_sender: chrome.runtime.MessageSender,
			sendResponse: (response: ExtensionResponse) => void
		) => {
			if (!isExtensionRequest(message)) {
				// Unknown or malformed message: safe no-op, never throw.
				sendSafeResponse(sendResponse);
				return false;
			}

			switch (message.type) {
				case "TOGGLE_SWITCH": {
					enqueueWrite(async () => {
						await new Promise<void>((resolve) => {
							chrome.storage.local.set({ isOn: message.isOn }, resolve);
						});
					});
					sendResponse({ success: true });
					return false;
				}

				case "RESET_HISTORY": {
					enqueueWrite(async () => {
						await new Promise<void>((resolve) => {
							chrome.storage.local.set({ chatRoom: [] }, resolve);
						});
					});
					sendResponse({ success: true });
					return false;
				}

				case "SELECTED_TEXT":
				case "CHAT": {
					const rawText = message.type === "SELECTED_TEXT" ? message.text : message.chatMessage;
					// Cap input to the documented finite limit.
					const text = validateInput(rawText);
					if (text === null) {
						sendResponse({ error: "INVALID_INPUT" });
						return false;
					}
					processAiRequest(text)
						.then((result: AiRequestResponse) => sendResponse(result))
						.catch(() => {
							// Structured error, no user content logged.
							console.error("Unhandled error processing request");
							sendResponse({ error: "API_ERROR" });
						});
					return true; // Keep channel open for async response
				}
			}
		}
	);
}
