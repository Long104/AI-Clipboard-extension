export {}; // Avoid polluting the global namespace

function isNonEmptyString(value: unknown): value is string {
	return typeof value === "string" && value.trim().length > 0;
}

document.addEventListener("copy", async (event) => {
	const selectedText = document.getSelection()?.toString() ?? "";
	if (!isNonEmptyString(selectedText)) {
		return;
	}
	// Send the selected text to the background script
	chrome.runtime.sendMessage(
		{
			type: "SELECTED_TEXT",
			text: selectedText,
		},
		(response) => {
			if (response?.modifiedText) {
				// Use Clipboard API in the content script
				navigator.clipboard.writeText(response.modifiedText).catch((err) => {
					console.error("Failed to copy text", err instanceof Error ? err.message : String(err));
				});
			} else if (response?.error) {
				// Show error state to user; no state mutated by content script
				console.warn("Request failed", response.error);
			} else {
				console.warn("Unexpected response format");
			}
		});
	});
