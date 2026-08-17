import React, { useEffect, useState, useCallback } from "react";
import "@/style.css";
import { MantineProvider, Button } from "@mantine/core";
import "@mantine/core/styles.css";

interface ChatMessage {
	message: string;
	sender: "user" | "bot";
}

const IndexSidepanel = () => {
	const [chatRoom, setChatRoom] = useState<ChatMessage[]>([]);
	const [chat, setChat] = useState<string>("");
	const [isLimit, setIsLimit] = useState<number>(0);
	const [isLimitReached, setIsLimitReached] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const setupStorageListeners = useCallback(() => {
		if (typeof chrome !== "undefined" && chrome.storage?.onChanged) {
			const handleStorageChange = (
				changes: { [key: string]: chrome.storage.StorageChange },
				area: "local" | "sync" | "managed"
			) => {
				if (area === "local") {
					if (changes.chatRoom) {
						const newValue = changes.chatRoom.newValue;
						if (Array.isArray(newValue)) {
							setChatRoom(newValue);
						}
					}
					if (changes.limit) {
						const newValue = changes.limit.newValue;
						if (typeof newValue === "number") {
							setIsLimit(newValue);
							setIsLimitReached(newValue >= 10);
						}
					}
				}
			};

			chrome.storage.onChanged.addListener(handleStorageChange);
			return () => {
				chrome.storage.onChanged.removeListener(handleStorageChange);
			};
		}
	}, []);

	// Initial storage read
	useEffect(() => {
		(async () => {
			try {
				setLoading(true);
				setError(null);

				const limitData = await new Promise<{ limit?: number }>((resolve) => {
					chrome.storage.local.get(["limit"], resolve);
				});

				const limit = limitData.limit || 0;
				setIsLimit(limit);
				setIsLimitReached(limit >= 10);

				const chatHistoryData = await new Promise<{ chatRoom?: ChatMessage[] }>((resolve) => {
					chrome.storage.local.get(["chatRoom"], resolve);
				});

				setChatRoom(chatHistoryData.chatRoom || []);
			} catch (err) {
				console.error("Initial storage read error", err);
				setError("Failed to load chat history");
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	// Setup storage change listeners
	useEffect(() => {
		return setupStorageListeners();
	}, [setupStorageListeners]);

	async function sendChat() {
		const trimmedChat = chat.trim();
		if (!trimmedChat) {
			return;
		}

		if (isLimitReached) {
			setError("Limit reached. Please wait for the reset.");
			return;
		}

		setChat("");
		setError(null);

		chrome.runtime.sendMessage(
			{ type: "CHAT", chatMessage: trimmedChat },
			(response) => {
				if (response?.error) {
					setError(response.error);
				}
			}
		);
	}

	const handleResetHistory = useCallback(() => {
		chrome.runtime.sendMessage({ type: "RESET_HISTORY" }, (response) => {
			if (response?.success) {
				setChatRoom([]);
				setIsLimit(0);
				setIsLimitReached(false);
				setError(null);
			} else {
				setError("Failed to reset history");
			}
		});
	}, []);

	if (loading) {
		return (
			<div className="min-h-screen min-w-screen flex items-center justify-center bg-gray-100">
				<div className="text-lg">Loading chat history...</div>
			</div>
		);
	}

	return (
		<MantineProvider>
			<div className="min-h-screen min-w-screen flex flex-col justify-between flex-1 relative bg-gray-400 overscroll-y-none">
				<div className="flex flex-col">
					{error && (
						<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 mx-4">
							<div className="font-bold">Error</div>
							<div>{error}</div>
						</div>
					)}

					{chatRoom.length === 0 && !error && (
						<div className="text-center py-8 text-gray-500">
							Copy text or ask a question
						</div>
					)}

					{chatRoom.map((msg, index) => (
						<div
							key={index}
							className={`flex mt-2 ${msg.sender === "bot" ? "justify-start pl-2" : "justify-end pr-2"}`}
						>
							<div className="max-w-[75%] break-words text-wrap border-2 p-2 gap-y-60 border-gray-800 bg-white rounded-2xl">
								{msg.message}
							</div>
						</div>
					))}
				</div>

				<div className="w-full flex items-center flex-col justify-center p-5">
					<div className="flex justify-start w-full gap-x-2 items-center mb-2">
						<div className="max-w-16">
							<Button
								size="xs"
								radius="md"
								variant="filled"
								color="rgba(36, 32, 32, 1)"
								onClick={handleResetHistory}
							>
								reset
							</Button>
						</div>

						<div className="text-sm text-gray-600">
							Usage: {isLimit}/10
						</div>

						{isLimitReached && (
							<div className="text-red-500 text-sm">
								Limit reached. Awaiting reset...
							</div>
						)}
					</div>

					<textarea
						placeholder="ask ai"
						className="text-sm w-full min-h-[50px] border-slate-600 border-solid border-2 rounded-3xl pl-4 text-wrap flex placeholder:text-start pt-1"
						onChange={(e) => setChat(e.target.value)}
						value={chat}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								sendChat();
							}
						}}
					/>
				</div>
			</div>
		</MantineProvider>
	);
};

export default IndexSidepanel;
