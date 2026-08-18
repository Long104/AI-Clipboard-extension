import type { ExtensionRequest, AiRequestResponse } from "../shared/messages";
import { isAiRequestResponse } from "../shared/messages";

export {}; // Avoid polluting the global namespace

function isNonEmptyString(value: unknown): value is string {
	return typeof value === "string" && value.trim().length > 0;
}

document.addEventListener("copy", () => {
	const selectedText = document.getSelection()?.toString() ?? "";
	if (!isNonEmptyString(selectedText)) {
		return;
	}

	const message: ExtensionRequest = {
		type: "SELECTED_TEXT",
		text: selectedText,
	};

	chrome.runtime.sendMessage(message, (response: unknown) => {
		if (!isAiRequestResponse(response)) {
			// Malformed/unknown response: safe no-op, no content logged.
			return;
		}
		if ("modifiedText" in response && response.modifiedText) {
			navigator.clipboard.writeText(response.modifiedText).catch(() => {
				// Clipboard write failure is non-fatal for the copy flow.
				console.error("Clipboard write failed");
			});
		}
		// On error responses the content script mutates no state; the side
		// panel surfaces user-safe messaging.
	});
});
