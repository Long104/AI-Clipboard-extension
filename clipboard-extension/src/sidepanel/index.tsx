import React, { useEffect, useState, useCallback, useRef } from "react";
import "@/style.css";
import { MantineProvider, Button } from "@mantine/core";
import "@mantine/core/styles.css";

interface ChatMessage {
	message: string;
	sender: "user" | "bot";
}

// Helper function to map error codes to user-friendly messages
function getErrorMessage(error: string | undefined): string {
	if (!error) return "";

	switch (error) {
		case "API_ERROR":
			return "Unable to process request. Check connection or quota.";
		case "LIMIT_REACHED":
			return "Usage limit reached. Please wait for the reset.";
		case "DISABLED":
			return "Extension is paused. Turn it on from the popup.";
		case "INVALID_INPUT":
			return "Please enter a message.";
		default:
			return error;
	}
}

const IndexSidepanel = () => {
	const [chatRoom, setChatRoom] = useState<ChatMessage[]>([]);
	const [chat, setChat] = useState<string>("");
	const [isLimit, setIsLimit] = useState<number>(0);
	const [isLimitReached, setIsLimitReached] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);

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

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
	}, [chatRoom]);

	async function sendChat() {
		const trimmedChat = chat.trim();
		if (!trimmedChat || pending) {
			return;
		}

		if (isLimitReached) {
			setError(getErrorMessage("LIMIT_REACHED"));
			return;
		}

		setChat("");
		setError(null);
		setPending(true);

		chrome.runtime.sendMessage(
			{ type: "CHAT", chatMessage: trimmedChat },
			(response) => {
				setPending(false);
				if (chrome.runtime.lastError) {
					setError("Unable to reach background service.");
					return;
				}
				if (response?.error) {
					setError(getErrorMessage(response.error));
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
			<div className="min-h-screen min-w-screen flex flex-col flex-1 relative bg-gray-100 overscroll-y-none">
				<div className="flex flex-col flex-1 overflow-y-auto min-h-0 px-2 pb-2">
					{error && (
						<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 mx-4 mt-3">
							<div className="font-bold">Error</div>
							<div>{error}</div>
						</div>
					)}

					{chatRoom.length === 0 && !error && (
						<div className="text-center py-8 text-gray-500 pt-6">
							Copy text or ask a question
						</div>
					)}

					{chatRoom.map((msg, index) => (
						<div
							key={index}
							className={`flex mt-2 ${msg.sender === "bot" ? "justify-start" : "justify-end"}`}
						>
							<div
								className={`max-w-[75%] break-words p-2.5 ${
									msg.sender === "bot"
										? "bg-white border border-gray-200 text-gray-900 rounded-2xl rounded-bl-md"
										: "bg-blue-600 text-white rounded-2xl rounded-br-md"
								}`}
							>
								{msg.message}
							</div>
						</div>
					))}
					<div ref={messagesEndRef} />
				</div>

				<div className="w-full flex items-center flex-col justify-center p-5">
					<div className="flex justify-start w-full gap-x-2 items-center mb-2">
						<Button size="xs" radius="md" variant="subtle" color="gray" onClick={handleResetHistory} aria-label="Reset chat history">Reset</Button>

						<div className="text-sm text-gray-600">
							Usage: {isLimit}/10
						</div>

						{isLimitReached && (
							<div className="text-red-500 text-sm">
								Limit reached. Awaiting reset...
							</div>
						)}
					</div>
					<div className="flex w-full items-end gap-2">
						<textarea
							placeholder="Ask AI…"
							rows={2}
							disabled={pending}
							className="text-sm w-full min-h-[50px] border border-gray-300 rounded-xl pl-4 pt-2 resize-none bg-white placeholder:text-gray-400 disabled:opacity-60"
							onChange={(e) => setChat(e.target.value)}
							value={chat}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									sendChat();
								}
							}}
						/>
						<Button size="sm" radius="md" loading={pending} disabled={!chat.trim() || isLimitReached} onClick={sendChat}>Send</Button>
					</div>
				</div>
			</div>
		</MantineProvider>
	);
};

export default IndexSidepanel;
