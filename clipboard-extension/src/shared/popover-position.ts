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