import { describe, it, expect } from "vitest";
import { shouldCaptureCopy, shouldShowPill, CAPTURE_MIN_LENGTH } from "../shared/capture";

describe("capture logic", () => {
	describe("shouldCaptureCopy", () => {
		it("should return true for valid text when capture is enabled", () => {
			expect(shouldCaptureCopy("this is a valid text", true)).toBe(true);
		});

		it("should return false when capture is disabled", () => {
			expect(shouldCaptureCopy("this is a valid text", false)).toBe(false);
		});

		it("should return false for text shorter than the minimum length", () => {
			expect(shouldCaptureCopy("a", true)).toBe(false);
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

	describe("shouldShowPill", () => {
		it("should return false for empty or single characters", () => {
			expect(shouldShowPill("")).toBe(false);
			expect(shouldShowPill("1")).toBe(false);
		});

		it("should return true for 2+ characters", () => {
			expect(shouldShowPill("12")).toBe(true);
			expect(shouldShowPill("this")).toBe(true);
		});

		it("should trim the text before checking length", () => {
			expect(shouldShowPill("   123   ")).toBe(true);
			expect(shouldShowPill("   1   ")).toBe(false);
		});
	});
});
