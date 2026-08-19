export const POPOVER_WIDTH = 360;
export const POPOVER_MARGIN = 12;   // min distance from viewport edges
export const POPOVER_GAP = 8;       // gap between anchor point and card
export const POPOVER_MAX_HEIGHT = 320; // also the card body max-height

export type PopoverPlacement = { left: number; top: number; placement: "below" | "above" };

export function computePlacement(
	anchor: { x: number; y: number },
	viewport: { width: number; height: number }
): PopoverPlacement {
	const maxLeft = Math.max(POPOVER_MARGIN, viewport.width - POPOVER_WIDTH - POPOVER_MARGIN);
	const left = Math.min(Math.max(anchor.x - POPOVER_WIDTH / 2, POPOVER_MARGIN), maxLeft);
	const belowTop = anchor.y + POPOVER_GAP;
	if (belowTop + POPOVER_MAX_HEIGHT <= viewport.height - POPOVER_MARGIN) {
		return { left, top: belowTop, placement: "below" };
	}
	const aboveTop = Math.max(POPOVER_MARGIN, anchor.y - POPOVER_GAP - POPOVER_MAX_HEIGHT);
	return { left, top: aboveTop, placement: "above" };
}

export const PILL_WIDTH = 280;  // estimated rendered pill width
export const PILL_HEIGHT = 36;  // estimated rendered pill height

export type PillPlacement = { left: number; top: number; placement: "below" | "above" };

/** left is the pill CENTER x (container keeps -translate-x-1/2). Viewport coords only. */
export function computePillPlacement(
	rect: { left: number; top: number; width: number; bottom: number },
	viewport: { width: number; height: number }
): PillPlacement {
	const centerX = rect.left + rect.width / 2;
	const minLeft = POPOVER_MARGIN + PILL_WIDTH / 2;
	const maxLeft = Math.max(minLeft, viewport.width - PILL_WIDTH / 2 - POPOVER_MARGIN);
	const left = Math.min(Math.max(centerX, minLeft), maxLeft);
	const belowTop = rect.bottom + POPOVER_GAP;
	if (belowTop + PILL_HEIGHT <= viewport.height - POPOVER_MARGIN) {
		return { left, top: belowTop, placement: "below" };
	}
	const aboveTop = Math.max(POPOVER_MARGIN, rect.top - POPOVER_GAP - PILL_HEIGHT);
	return { left, top: aboveTop, placement: "above" };
}