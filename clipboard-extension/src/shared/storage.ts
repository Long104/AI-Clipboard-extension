import type { ChatMessage } from "../background";

export interface SidepanelState {
	limit: number;
	chatRoom: ChatMessage[];
}

/**
 * Perform one initial storage read for both limit and history.
 * Used by sidepanel to avoid redundant sequential storage reads.
 */
export async function loadInitialSidepanelState(): Promise<SidepanelState> {
	const data = await new Promise<{ limit?: number; chatRoom?: ChatMessage[] }>((resolve) => {
		chrome.storage.local.get(["limit", "chatRoom"], resolve);
	});
	return {
		limit: data.limit || 0,
		chatRoom: data.chatRoom || [],
	};
}
