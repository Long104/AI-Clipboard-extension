import { describe, expect, it, vi } from "vitest";
import { isExtensionRequest, validateInput } from "../shared/messages";
import { loadInitialSidepanelState } from "../shared/storage";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Switch, MantineProvider } from "@mantine/core";

describe("shared contracts", () => {
	it("isExtensionRequest rejects malformed messages without throwing", () => {
		expect(isExtensionRequest({ type: "UNKNOWN" })).toBe(false);
		expect(isExtensionRequest({ type: "TOGGLE_SWITCH" })).toBe(false); // missing isOn
		expect(isExtensionRequest({ type: "SELECTED_TEXT", text: 123 })).toBe(false);
	});

	it("validateInput caps input length", () => {
		expect(validateInput("hello")).toBe("hello");
		expect(validateInput(" ".repeat(10001))).toBe(null);
		expect(validateInput(123)).toBe(null);
	});

	it("loadInitialSidepanelState calls storage.local.get once with both keys", async () => {
		const mockGet = vi.fn((keys, cb) => cb({ limit: 1, chatRoom: [] }));
		(global as any).chrome = { storage: { local: { get: mockGet } } };
		await loadInitialSidepanelState();
		expect(mockGet).toHaveBeenCalledTimes(1);
		expect(mockGet).toHaveBeenCalledWith(["limit", "chatRoom"], expect.any(Function));
	});
});

describe("accessibility", () => {
	it("Mantine Switch exposes role=switch", () => {
		const html = renderToStaticMarkup(
			createElement(MantineProvider, null,
				createElement(Switch, { checked: true, onChange: () => {}, "aria-label": "Toggle" })
			)
		);
		expect(html).toContain('role="switch"');
		expect(html).toContain('type="checkbox"');
	});
});
