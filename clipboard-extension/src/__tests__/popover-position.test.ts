import { describe, expect, it } from "vitest";
import {
	computePlacement,
	POPOVER_GAP,
	POPOVER_MARGIN,
	POPOVER_MAX_HEIGHT,
	POPOVER_WIDTH,
} from "../shared/popover-position";

describe("shared/popover-position", () => {
	it("mid-viewport anchor places card below, horizontally centered", () => {
		const res = computePlacement({ x: 500, y: 300 }, { width: 1000, height: 800 });
		expect(res.placement).toBe("below");
		expect(res.top).toBe(300 + POPOVER_GAP);
		expect(res.left).toBe(500 - POPOVER_WIDTH / 2);
	});

	it("near-bottom anchor flips card above", () => {
		const res = computePlacement({ x: 500, y: 750 }, { width: 1000, height: 800 });
		expect(res.placement).toBe("above");
		expect(res.top).toBe(750 - POPOVER_GAP - POPOVER_MAX_HEIGHT);
	});

	it("near-left edge clamps left to POPOVER_MARGIN", () => {
		const res = computePlacement({ x: 10, y: 300 }, { width: 1000, height: 800 });
		expect(res.left).toBe(POPOVER_MARGIN);
	});

	it("near-right edge clamps left to fit viewport", () => {
		const res = computePlacement({ x: 990, y: 300 }, { width: 1000, height: 800 });
		expect(res.left).toBe(1000 - POPOVER_WIDTH - POPOVER_MARGIN);
	});

	it("tiny viewport handles no-NaN left clamp", () => {
		const res = computePlacement({ x: 50, y: 300 }, { width: 300, height: 800 });
		expect(res.left).toBe(POPOVER_MARGIN);
		expect(Number.isNaN(res.left)).toBe(false);
	});

	it("above-flip top clamps to POPOVER_MARGIN when top space is limited", () => {
		// Viewport height 400, anchor y = 300 (belowTop = 308, 308+320 > 388 so it flips above)
		// aboveTop = 300 - 8 - 320 = -28 -> clamped to POPOVER_MARGIN
		const res = computePlacement({ x: 500, y: 300 }, { width: 1000, height: 400 });
		expect(res.placement).toBe("above");
		expect(res.top).toBe(POPOVER_MARGIN);
	});
});
