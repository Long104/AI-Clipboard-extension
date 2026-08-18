import React, { useEffect, useState, useCallback, useRef } from "react";
import "@/style.css";
import "@mantine/core/styles.css";
import { MantineProvider, Button, Textarea, Loader } from "@mantine/core";
import { theme } from "@/shared/theme";
import type { ChatMessage } from "@/background";
import type { ExtensionRequest } from "@/shared/messages";

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

	// Single initial storage read for limit and chatRoom
	useEffect(() => {
		let isMounted = true;
		(async () => {
			try {
				setLoading(true);
				setError(null);
				const data = await new Promise<{ limit?: number; chatRoom?: ChatMessage[] }>((resolve) => {
					chrome.storage.local.get(["limit", "chatRoom"], resolve);
				});
				if (isMounted) {
					setIsLimit(data.limit || 0);
					setIsLimitReached((data.limit || 0) >= 10);
					setChatRoom(data.chatRoom || []);
				}
			} catch (err) {
				if (isMounted) {
					setError("Failed to load chat history");
				}
			} finally {
				if (isMounted) {
					setLoading(false);
				}
			}
		})();

		return () => {
			isMounted = false;
		};
	}, []);

	// Setup storage change listeners with cleanup
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

		const message: ExtensionRequest = { type: "CHAT", chatMessage: trimmedChat };

		chrome.runtime.sendMessage(
			message,
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
		const message: ExtensionRequest = { type: "RESET_HISTORY" };
		chrome.runtime.sendMessage(message, (response) => {
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
			<MantineProvider theme={theme}>
				<div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
					<Loader size="md" />
					<div className="text-sm mt-2 text-gray-600 dark:text-gray-400">Loading history...</div>
				</div>
			</MantineProvider>
		);
	}

	return (
		<MantineProvider theme={theme}>
			<div className="min-h-screen flex flex-col flex-1 relative bg-gray-100 dark:bg-gray-900 overscroll-y-none">
				<div className="flex flex-col flex-1 overflow-y-auto min-h-0 px-3 pb-2">
					{error && (
						<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 mx-2 mt-3 text-sm">
							<div className="font-bold">Error</div>
							<div>{error}</div>
						</div>
					)}

					{chatRoom.length === 0 && !error && (
						<div className="text-center py-8 text-gray-500 pt-6 text-sm">
							Copy text or ask a question
						</div>
					)}

					{chatRoom.map((msg, index) => (
						<div
							key={index}
							className={`flex mt-2 ${msg.sender === "bot" ? "justify-start" : "justify-end"}`}
						>
							<div
								className={`max-w-[85%] break-words p-2.5 text-sm ${
									msg.sender === "bot"
										? "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-2xl rounded-bl-md"
										: "bg-blue-600 text-white rounded-2xl rounded-br-md"
								}`}
							>
								{msg.message}
							</div>
						</div>
					))}
					<div ref={messagesEndRef} />
				</div>

				<div className="w-full flex items-center flex-col justify-center p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
					<div className="flex justify-between w-full items-center mb-2 px-1">
						<Button size="xs" radius="md" variant="subtle" color="gray" onClick={handleResetHistory} aria-label="Reset chat history">Reset</Button>

						<div className="text-xs text-gray-600 dark:text-gray-400">
							Usage: {isLimit}/10
						</div>

						{isLimitReached && (
							<div className="text-red-500 text-xs font-semibold">
								Limit reached
							</div>
						)}
					</div>
					<div className="flex w-full items-end gap-2">
						<Textarea
							placeholder="Ask AI…"
							rows={2}
							disabled={pending}
							className="text-sm w-full"
							onChange={(e) => setChat(e.target.value)}
							value={chat}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									sendChat();
								}
							}}
							aria-label="Ask AI input field"
						/>
						<Button size="sm" radius="md" loading={pending} disabled={!chat.trim() || isLimitReached} onClick={sendChat}>Send</Button>
					</div>
				</div>
			</div>
		</MantineProvider>
	);
};

export default IndexSidepanel;
