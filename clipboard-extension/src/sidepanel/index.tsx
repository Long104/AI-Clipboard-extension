import React, { useEffect, useState, useCallback, useRef } from "react";
import "@/style.css";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Copy, Check, RotateCcw, Send, Sparkles, ShieldAlert } from "lucide-react";
import type { ChatMessage } from "@/background";
import type { ExtensionRequest } from "@/shared/messages";

// Helper function to map error codes to user-friendly messages
export function getErrorMessage(error: string | undefined): string {
	if (!error) return "";

	switch (error) {
		case "API_ERROR":
			return "Unable to process request. Check connection or quota.";
		case "SERVER_ERROR":
			return "AI service is busy — retrying usually fixes it.";
		case "INPUT_TOO_LONG":
			return "Text too long — trimmed it for you.";
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

function CodeBlock({ code, language }: { code: string; language?: string }) {
	const [copied, setCopied] = useState(false);
	const copyCode = useCallback(() => {
		navigator.clipboard.writeText(code).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	}, [code]);

	return (
		<div className="mt-2 rounded-lg border border-slate-700/50 overflow-hidden">
			<div className="flex items-center justify-between bg-slate-800 dark:bg-slate-900 px-3 py-1.5">
				<span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
					{language || "text"}
				</span>
				<Button
					variant="ghost"
					size="icon"
					onClick={copyCode}
					aria-label="Copy code block"
					className="h-6 w-6 text-slate-400 hover:text-slate-100"
				>
					{copied ? <Check size={12} /> : <Copy size={12} />}
				</Button>
			</div>
			<pre className="font-mono text-xs text-slate-100 bg-slate-950 p-3 overflow-x-auto whitespace-pre-wrap break-words">
				{code}
			</pre>
		</div>
	);
}

function Skeleton() {
	return (
		<div className="flex justify-start mt-2">
			<div className="max-w-[85%] w-3/4">
				<div className="animate-pulse bg-slate-200 dark:bg-slate-700 h-10 w-full rounded-xl mb-2" />
				<div className="animate-pulse bg-slate-200 dark:bg-slate-700 h-10 w-3/4 rounded-xl" />
			</div>
		</div>
	);
}

const FENCE_RE = /```(\w+)?\n([\s\S]*?)```/g;

function MessageContent({ text }: { text: string }) {
	const parts: Array<{ type: "text" | "code"; content: string; lang?: string }> = [];
	let lastIndex = 0;
	let match: RegExpExecArray | null;
	FENCE_RE.lastIndex = 0;
	while ((match = FENCE_RE.exec(text)) !== null) {
		if (match.index > lastIndex) {
			parts.push({ type: "text", content: text.slice(lastIndex, match.index).trim() });
		}
		parts.push({ type: "code", lang: match[1] || "text", content: match[2].trim() });
		lastIndex = FENCE_RE.lastIndex;
	}
	if (lastIndex < text.length) {
		parts.push({ type: "text", content: text.slice(lastIndex).trim() });
	}

	if (parts.length === 0) {
		return <span className="whitespace-pre-wrap break-words">{text}</span>;
	}

	return (
		<div className="space-y-2">
			{parts.map((part, i) =>
				part.type === "code" ? (
					<CodeBlock key={i} code={part.content} language={part.lang} />
				) : (
					<span key={i} className="whitespace-pre-wrap break-words">
						{part.content}
					</span>
				)
			)}
		</div>
	);
}

function DisabledBanner({ onEnable }: { onEnable: () => void }) {
	return (
		<div className="flex items-start gap-3 p-3.5 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10">
			<ShieldAlert size={18} className="text-amber-500 shrink-0 mt-0.5" />
			<div className="flex flex-col gap-2">
				<span className="text-sm font-medium text-amber-900 dark:text-amber-200">
					Extension is currently paused
				</span>
				<Button variant="secondary" size="sm" onClick={onEnable} className="w-fit">
					Enable extension
				</Button>
			</div>
		</div>
	);
}

const IndexSidepanel = () => {
	const [chatRoom, setChatRoom] = useState<ChatMessage[]>([]);
	const [chat, setChat] = useState<string>("");
	const [isLimit, setIsLimit] = useState<number>(0);
	const [isLimitReached, setIsLimitReached] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState(false);
	const [isOn, setIsOn] = useState(true);
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
					if (changes.isOn) {
						const newValue = changes.isOn.newValue;
						if (typeof newValue === "boolean") {
							setIsOn(newValue);
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
				const data = await new Promise<{ limit?: number; chatRoom?: ChatMessage[]; isOn?: boolean }>((resolve) => {
					chrome.storage.local.get(["limit", "chatRoom", "isOn"], resolve);
				});
				if (isMounted) {
					setIsLimit(data.limit || 0);
					setIsLimitReached((data.limit || 0) >= 10);
					setChatRoom(data.chatRoom || []);
					setIsOn(data.isOn ?? true);
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
			} else if (response?.truncated) {
				setError(getErrorMessage("INPUT_TOO_LONG"));
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
			<div className="h-full flex flex-col items-center justify-center bg-white dark:bg-slate-950">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
				<div className="text-sm mt-3 text-slate-500">Loading history...</div>
			</div>
		);
	}

	return (
		<div className="h-full flex flex-col relative bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
			<div className="flex-1 overflow-y-auto overflow-x-hidden px-4 pt-4 pb-4">
				{!isOn && <DisabledBanner onEnable={() => {
                    chrome.runtime.sendMessage({ type: "TOGGLE_SWITCH", isOn: true });
                    setIsOn(true);
                }} />}

				{error && (
					<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-4 text-sm flex gap-2">
						<ShieldAlert size={18} />
						<span>{error}</span>
					</div>
				)}

				{chatRoom.length === 0 && !error && (
					<div className="text-center py-16 text-slate-500 dark:text-slate-400 text-sm">
						<Sparkles size={32} className="mx-auto mb-3 opacity-50" />
						Copy text or ask a question to start.
					</div>
				)}

				{chatRoom.map((msg, index) => (
					<div
						key={index}
						className={cn("flex mt-3", msg.sender === "bot" ? "justify-start" : "justify-end")}
					>
						<div
							className={cn(
								"max-w-[85%] text-sm min-w-0 overflow-hidden w-fit",
								msg.sender === "bot"
									? "bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-sm p-3.5"
									: "bg-blue-600 text-white rounded-2xl rounded-br-sm p-3"
							)}
						>
							<MessageContent text={msg.message} />
						</div>
					</div>
				))}
				{pending && <Skeleton />}
				<div ref={messagesEndRef} />
			</div>

			<div className="shrink-0 w-full flex flex-col p-3 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm border-t border-slate-200 dark:border-slate-800">
				<div className="flex justify-between w-full items-center mb-2 px-1">
					<Button variant="ghost" size="sm" onClick={handleResetHistory} className="text-slate-500 hover:text-slate-900">
						<RotateCcw size={14} className="mr-1.5" />
						Reset
					</Button>
					<div className="text-xs text-slate-400 font-medium tracking-tight">
						{isLimit}/10 Usage
					</div>
				</div>
				<div className="flex w-full items-end gap-2">
					<textarea
						placeholder="Ask AI…"
						rows={1}
						disabled={pending || !isOn}
						className="flex-1 min-h-[48px] max-h-[120px] resize-none border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl text-sm p-3 bg-slate-50 dark:bg-slate-900 dark:text-slate-100 disabled:opacity-50"
						onChange={(e) => setChat(e.target.value)}
						value={chat}
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								sendChat();
							}
						}}
					/>
					<Button size="icon" className="h-[48px] w-[48px] shrink-0" onClick={sendChat} disabled={!chat.trim() || isLimitReached || pending || !isOn}>
						{pending ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <Send size={18} />}
					</Button>
				</div>
			</div>
		</div>
	);
};


export default IndexSidepanel;
