import { describe, it, expect } from "vitest";
import { shouldCaptureCopy, CAPTURE_MIN_LENGTH } from "../shared/capture";

describe("capture logic", () => {
	describe("shouldCaptureCopy", () => {
		it("should return true for valid text when capture is enabled", () => {
			expect(shouldCaptureCopy("this is a valid text", true)).toBe(true);
		});

		it("should return false when capture is disabled", () => {
			expect(shouldCaptureCopy("this is a valid text", false)).toBe(false);
		});

		it("should return false for text shorter than the minimum length", () => {
			expect(shouldCaptureCopy("short", true)).toBe(false);
		});

		it("should return true for text exactly at the boundary length + 1", () => {
			const text = "a".repeat(CAPTURE_MIN_LENGTH + 1);
			expect(shouldCaptureCopy(text, true)).toBe(true);
		});

		it("should return false for empty or whitespace-only strings", () => {
			expect(shouldCaptureCopy("", true)).toBe(false);
			expect(shouldCaptureCopy("   ", true)).toBe(false);
		});

		it("should return false for non-string inputs", () => {
			expect(shouldCaptureCopy(null, true)).toBe(false);
			expect(shouldCaptureCopy(undefined, true)).toBe(false);
			expect(shouldCaptureCopy(123456, true)).toBe(false);
			expect(shouldCaptureCopy({ text: "hello" }, true)).toBe(false);
		});

		it("should trim the text before checking length", () => {
			const text = `   ${"a".repeat(CAPTURE_MIN_LENGTH + 1)}   `;
			expect(shouldCaptureCopy(text, true)).toBe(true);
			const shortText = `   ${"a".repeat(CAPTURE_MIN_LENGTH)}   `;
			expect(shouldCaptureCopy(shortText, true)).toBe(false);
		});
	});
});
