import { describe, it, expect } from "vitest";
import {
	parseSettings,
	isByoActive,
	DEFAULT_SETTINGS,
	type ExtensionSettings,
} from "../shared/settings";

describe("settings", () => {
	describe("parseSettings", () => {
		it("should return default settings for undefined or null", () => {
			expect(parseSettings(undefined)).toEqual(DEFAULT_SETTINGS);
			expect(parseSettings(null)).toEqual(DEFAULT_SETTINGS);
		});

		it("should return default settings for non-object values", () => {
			expect(parseSettings(123)).toEqual(DEFAULT_SETTINGS);
			expect(parseSettings("string")).toEqual(DEFAULT_SETTINGS);
			expect(parseSettings(true)).toEqual(DEFAULT_SETTINGS);
		});

		it("should return default settings for an empty object", () => {
			expect(parseSettings({})).toEqual(DEFAULT_SETTINGS);
		});

		it("should correctly merge partial settings", () => {
			const partial = { overlayEnabled: false, apiKey: "test-key" };
			const expected = { ...DEFAULT_SETTINGS, ...partial };
			expect(parseSettings(partial)).toEqual(expected);
		});

		it("should ignore invalid value types and use defaults", () => {
			const invalid = {
				apiKey: 123,
				usageMode: "invalid-mode",
				overlayEnabled: "not-a-boolean",
				captureOnCopy: null,
			};
			const expected = {
				...DEFAULT_SETTINGS,
				apiKey: DEFAULT_SETTINGS.apiKey, // apiKey: 123 becomes ""
				usageMode: "free",
				overlayEnabled: true,
				captureOnCopy: true,
			};
			const result = parseSettings(invalid);
			expect(result.apiKey).toBe(DEFAULT_SETTINGS.apiKey);
			expect(result.usageMode).toBe(DEFAULT_SETTINGS.usageMode);
			expect(result.overlayEnabled).toBe(DEFAULT_SETTINGS.overlayEnabled);
			expect(result.captureOnCopy).toBe(DEFAULT_SETTINGS.captureOnCopy);
		});

		it("should handle a valid full settings object", () => {
			const validSettings: ExtensionSettings = {
				apiKey: "my-key",
				usageMode: "byo",
				overlayEnabled: false,
				captureOnCopy: false,
			};
			expect(parseSettings(validSettings)).toEqual(validSettings);
		});
	});

	describe("isByoActive", () => {
		it("should be true for BYO mode with a valid key", () => {
			const settings: ExtensionSettings = {
				...DEFAULT_SETTINGS,
				usageMode: "byo",
				apiKey: "sk-test-key",
			};
			expect(isByoActive(settings)).toBe(true);
		});

		it("should be false for BYO mode with an empty key", () => {
			const settings: ExtensionSettings = {
				...DEFAULT_SETTINGS,
				usageMode: "byo",
				apiKey: "",
			};
			expect(isByoActive(settings)).toBe(false);
		});

		it("should be false for BYO mode with a whitespace key", () => {
			const settings: ExtensionSettings = {
				...DEFAULT_SETTINGS,
				usageMode: "byo",
				apiKey: "   ",
			};
			expect(isByoActive(settings)).toBe(false);
		});

		it("should be false for free mode, even with a key", () => {
			const settings: ExtensionSettings = {
				...DEFAULT_SETTINGS,
				usageMode: "free",
				apiKey: "sk-test-key",
			};
			expect(isByoActive(settings)).toBe(false);
		});
	});
});
