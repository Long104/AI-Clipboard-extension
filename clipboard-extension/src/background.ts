import type {
	AiRequestError,
	AiRequestResponse,
	ExtensionRequest,
	ExtensionResponse,
} from "./shared/messages";
import { clampInput, isExtensionRequest, validateInput } from "./shared/messages";
import { isByoActive, parseSettings } from "./shared/settings";
import {
	POPOVER_REQUEST_KEY,
	POPOVER_RESULT_KEY,
	type PopoverResult,
	composePrompt,
} from "./shared/popover";

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
export const TRANSLATE_MAX_ATTEMPTS = 3;
export const TRANSLATE_RETRY_DELAYS_MS = [500, 1500] as const;

export type TranslateOutcome =
	| { ok: true; text: string }
	| { ok: false; code: "API_ERROR" | "SERVER_ERROR" };

/**
 * Build the absolute summarizeDocument endpoint from the configured base URL.
 * Normalizes the join so the result is correct whether or not the base URL
 * carries a trailing slash (e.g. "...workers.dev" or "...workers.dev/").
 */
export function buildTranslateEndpoint(
	baseUrl: string = process.env.PLASMO_PUBLIC_BASE_URL || ""
): string {
	return `${baseUrl.replace(/\/+$/, "")}/summarizeDocument`;
}

const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);

function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchTranslate(
	messageText: string,
	byoKey?: string
): Promise<TranslateOutcome> {
	const baseUrl = process.env.PLASMO_PUBLIC_BASE_URL || "";
	const apiKey = process.env.PLASMO_PUBLIC_API_KEY || "";
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
	};
	if (apiKey) {
		headers["Authorization"] = `Bearer ${apiKey}`;
	}
	if (byoKey) {
		headers["X-Extension-Key"] = byoKey;
	}

	let lastCode: "API_ERROR" | "SERVER_ERROR" = "SERVER_ERROR";

	for (let attempt = 0; attempt < TRANSLATE_MAX_ATTEMPTS; attempt++) {
		if (attempt > 0) {
			const delayMs =
				TRANSLATE_RETRY_DELAYS_MS[attempt - 1] ??
				TRANSLATE_RETRY_DELAYS_MS[TRANSLATE_RETRY_DELAYS_MS.length - 1];
			await delay(delayMs);
		}

		try {
			const res = await fetch(buildTranslateEndpoint(baseUrl), {
				method: "POST",
				headers,
				body: JSON.stringify({
					documentData: messageText,
				}),
			});

			if (res.ok) {
				const data = await res.json();
				const raw = data?.message?.response;
				// Accept string | number | boolean (e.g. math answers like 4),
				// coerce to string. Reject null/undefined/objects/arrays.
				if (
					raw !== null &&
					raw !== undefined &&
					(typeof raw === "string" ||
						typeof raw === "number" ||
						typeof raw === "boolean")
				) {
					return { ok: true, text: String(raw) };
				}
				console.error("Malformed API response", { status: res.status });
				return { ok: false, code: "SERVER_ERROR" };
			}

			// Capture worker-provided error detail ({ error, details }) for diagnosis.
			let detail: unknown = null;
			try {
				detail = await res.json();
			} catch {
				/* body not JSON */
			}
			console.error("Translation API error", {
				status: res.status,
				body: detail,
				attempt: attempt + 1,
			});

			if (RETRYABLE_STATUS.has(res.status)) {
				lastCode = "SERVER_ERROR";
				continue;
			}
			return { ok: false, code: "API_ERROR" };
		} catch (err) {
			lastCode = "API_ERROR";
			console.error("Translation network error", {
				attempt: attempt + 1,
				error: err instanceof Error ? err.message : String(err),
			});
		}
	}
	return { ok: false, code: lastCode };
}

export async function processAiRequest(
	inputText: string
): Promise<AiRequestResponse> {
	const rawText = validateInput(inputText);
	if (rawText === null) {
		return { error: "INVALID_INPUT" };
	}

	const { text, truncated } = clampInput(rawText);

	return enqueueWrite(async () => {
		const storageData = await new Promise<{
			isOn?: boolean;
			limit?: number;
			settings?: unknown;
		}>((resolve) => {
			chrome.storage.local.get(["isOn", "limit", "settings"], resolve);
		});

		const settings = parseSettings(storageData.settings);
		const byo = isByoActive(settings);

		const isOn = storageData.isOn ?? true;
		const limit = storageData.limit || 0;

		if (!isOn) {
			return { error: "DISABLED" };
		}

		if (!byo && limit >= MAX_USAGE_LIMIT) {
			setBadge("!", "#e03131");
			clearBadgeAfter(BADGE_CLEAR_MS);
			return { error: "LIMIT_REACHED" };
		}

		setBadge("AI", "#5c5f66");
		const translateResult = await fetchTranslate(
			text,
			byo ? settings.apiKey.trim() : undefined
		);
		if (translateResult.ok === false) {
			setBadge("!", "#e03131");
			clearBadgeAfter(BADGE_CLEAR_MS);
			return { error: translateResult.code };
		}
		const translatedText = translateResult.text;

		const data = await new Promise<{ chatRoom?: ChatMessage[] }>((resolve) => {
			chrome.storage.local.get(["chatRoom"], resolve);
		});

		const currentHistory = data.chatRoom || [];
		const updatedHistory: ChatMessage[] = [
			...currentHistory,
			{ message: text, sender: "user" },
			{ message: translatedText, sender: "bot" },
		];
		const updatedLimit = byo ? limit : limit + 1;

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
		return { modifiedText: translatedText, ...(truncated ? { truncated: true } : {}) };
	});
}

function sendSafeResponse(sendResponse: (response: ExtensionResponse) => void): void {
	sendResponse({ error: "API_ERROR" });
}

if (typeof chrome !== "undefined" && chrome.runtime?.onMessage) {
	chrome.runtime.onMessage.addListener(
		(
			message: unknown,
			sender: chrome.runtime.MessageSender,
			sendResponse: (response: ExtensionResponse) => void
		) => {
			if (!isExtensionRequest(message)) {
				// Unknown or malformed message: safe no-op, never throw.
				sendSafeResponse(sendResponse);
				return false;
			}

			switch (message.type) {
				case "GET_TAB_ID": {
					sendResponse({ tabId: sender?.tab?.id ?? null, frameId: sender?.frameId ?? 0 });
					return false;
				}

				case "OPEN_SIDEPANEL": {
					(async () => {
						try {
							if (process.env.PLASMO_BROWSER === "firefox") {
								// Firefox uses sidebarAction / native sidebar, not chrome.sidePanel
								if (globalThis.browser?.sidebarAction) {
									if (typeof globalThis.browser.sidebarAction.toggle === "function") {
										await globalThis.browser.sidebarAction.toggle();
									} else {
										await globalThis.browser.sidebarAction.open();
									}
								}
								sendResponse({ success: true });
								return;
							}

							// Gesture-safe path: use the tabId from the content script that
							// sent the message. This preserves the user gesture.
							if (sender?.tab?.id != null) {
								// @ts-ignore sidePanel is not yet in @types/chrome
								await chrome.sidePanel?.open?.({ tabId: sender.tab.id });
								sendResponse({ success: true });
							} else {
								// Fallback for context without a tab (e.g. extension popups)
								const win = await chrome.windows.getLastFocused();
								if (win?.id != null) {
									// @ts-ignore sidePanel is not yet in @types/chrome
									await chrome.sidePanel?.open?.({ windowId: win.id });
									sendResponse({ success: true });
								}
							}
						} catch (e) {
							console.error("Side panel open failed:", e);
							sendResponse({ success: false, error: "SIDEPANEL_ERROR" });
						}
					})();
					return true; // async
				}

				case "AI_ACTION": {
					const text = validateInput(message.text);
					if (text === null) {
						sendResponse({ error: "INVALID_INPUT" });
						return false;
					}
					const composed = composePrompt(message.action, text);
					const meta = {
						requestId: message.requestId,
						tabId: sender?.tab?.id ?? null,
						frameId: sender?.frameId ?? 0,
					};
					const writePopoverRequest = enqueueWrite(async () => {
						await new Promise<void>((resolve) => {
							chrome.storage.local.set(
								{ [POPOVER_REQUEST_KEY]: { ...meta, action: message.action, text, anchor: message.anchor, source: message.source, at: Date.now() } },
								resolve
							);
						});
					});
					writePopoverRequest.catch(() => {});
					processAiRequest(composed)
						.then(async (result: AiRequestResponse) => {
							const payload: PopoverResult =
								"modifiedText" in result
									? { ...meta, ok: true, text: result.modifiedText, truncated: result.truncated ?? false, at: Date.now() }
									: { ...meta, ok: false, error: result.error, at: Date.now() };
							await new Promise<void>((resolve) => {
								chrome.storage.local.set({ [POPOVER_RESULT_KEY]: payload }, resolve);
							});
							sendResponse(result);
						})
						.catch(() => {
							// Structured error, no user content logged (existing pattern).
							console.error("Unhandled error processing AI_ACTION");
							const payload: PopoverResult = { ...meta, ok: false, error: "API_ERROR", at: Date.now() };
							chrome.storage.local.set({ [POPOVER_RESULT_KEY]: payload }, () => { void 0; });
							sendResponse({ error: "API_ERROR" });
						});
					return true; // async response
				}

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

export async function handleCommand(
	command: string,
	openPanel: (options: { tabId?: number; windowId?: number }) => Promise<void> | void
): Promise<void> {
	if (command === "toggle-sidepanel") {
		try {
			// Chrome sidePanel (MV3) vs Firefox sidebarAction
			if (globalThis.browser?.sidebarAction) {
				if (typeof globalThis.browser.sidebarAction.toggle === "function") {
					await globalThis.browser.sidebarAction.toggle();
				} else {
					await globalThis.browser.sidebarAction.open();
				}
			} else {
				// Commands are user gestures; preference is active tabId
				const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
				if (tab?.id != null) {
					await openPanel({ tabId: tab.id });
				} else {
					const win = await chrome.windows.getLastFocused();
					if (win?.id != null) {
						await openPanel({ windowId: win.id });
					}
				}
			}
		} catch (e) {
			console.error("Failed to handle command:", e);
		}
	}
}

if (typeof chrome !== "undefined" && chrome.commands?.onCommand) {
	chrome.commands.onCommand.addListener((command) => {
		handleCommand(command, (target) => {
			if (process.env.PLASMO_BROWSER !== "firefox") {
				// @ts-ignore sidePanel is not yet in @types/chrome
				chrome.sidePanel?.open?.(target);
			}
		});
	});
}
