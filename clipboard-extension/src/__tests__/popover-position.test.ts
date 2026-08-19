import { describe, expect, it } from "vitest";
import {
	computePlacement,
	POPOVER_GAP,
	POPOVER_MARGIN,
	POPOVER_MAX_HEIGHT,
	POPOVER_WIDTH,
} from "../shared/popover-position";
import {
	computePillPlacement,
	PILL_HEIGHT,
	PILL_WIDTH,
} from "../shared/popover-position";

describe("shared/popover-position", () => {
	describe("computePlacement (card)", () => {
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
			const res = computePlacement({ x: 500, y: 300 }, { width: 1000, height: 400 });
			expect(res.placement).toBe("above");
			expect(res.top).toBe(POPOVER_MARGIN);
		});
	});

	describe("computePillPlacement", () => {
		const viewport = { width: 1000, height: 800 };

		it("13. rect mid-viewport → {placement:'below', top: rect.bottom+8} and left = centerX", () => {
			const rect = { left: 400, top: 300, width: 200, bottom: 320 };
			const placement = computePillPlacement(rect, viewport);
			expect(placement.placement).toBe("below");
			expect(placement.top).toBe(rect.bottom + POPOVER_GAP);
			expect(placement.left).toBe(rect.left + rect.width / 2);
		});

		it("14. rect.bottom + 8 + 36 > viewport.height - 12 → flips above: top = max(12, rect.top - 8 - 36)", () => {
			const rect = { left: 400, top: 750, width: 200, bottom: 770 };
			const placement = computePillPlacement(rect, viewport);
			expect(placement.placement).toBe("above");
			expect(placement.top).toBe(rect.top - POPOVER_GAP - PILL_HEIGHT);
		});

		it("15. centerX < 12 + 140 → left clamped to 152", () => {
			const rect = { left: 20, top: 300, width: 60, bottom: 320 };
			const placement = computePillPlacement(rect, viewport);
			const minLeft = POPOVER_MARGIN + PILL_WIDTH / 2;
			expect(placement.left).toBe(minLeft);
		});

		it("16. centerX > viewport.width - 152 → left clamped to viewport.width - 152", () => {
			const rect = { left: 920, top: 300, width: 60, bottom: 320 };
			const placement = computePillPlacement(rect, viewport);
			const maxLeft = viewport.width - PILL_WIDTH / 2 - POPOVER_MARGIN;
			expect(placement.left).toBe(maxLeft);
		});
	});
});
