import { validateInput } from "./messages";

export const CAPTURE_MIN_LENGTH = 5;
export const TOAST_CAPTURING_MS = 600;
export const TOAST_AUTO_DISMISS_MS = 5000;

/** Decide whether a text selection should surface the pill. */
export function shouldShowPill(text: string): boolean {
	return text.trim().length > CAPTURE_MIN_LENGTH;
}

/** Decide whether a copy event should surface the capture toast. */
export function shouldCaptureCopy(
	text: unknown,
	captureOnCopy: boolean,
): text is string {
	if (!captureOnCopy || typeof text !== "string") {
		return false;
	}
	const validatedText = validateInput(text);
	return validatedText !== null && validatedText.length > CAPTURE_MIN_LENGTH;
}
