import type { PlasmoCSConfig } from "plasmo";
import styleText from "data-text:@/style.css";
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { X, Sparkles, FileText, Copy, Check, MessagesSquare, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TabInfoResponse } from "@/shared/messages";
import { getErrorMessage } from "@/shared/errors";
import { MessageContent } from "@/components/message-content";
import {
	POPOVER_REQUEST_KEY,
	POPOVER_RESULT_KEY,
	triggerAiAction,
	applyPopoverResult,
	applyPopoverStorageChanges,
	type PopoverRequest,
	type PopoverResult,
	type PopoverState,
	type TabFrameInfo,
} from "@/shared/popover";
import { computePlacement, POPOVER_MAX_HEIGHT, POPOVER_WIDTH } from "@/shared/popover-position";

export const config: PlasmoCSConfig = { matches: ["<all_urls>"], all_frames: true };

export const getStyle = () => {
	const style = document.createElement("style");
	style.textContent = styleText;
	return style;
};

type PopoverState = import("@/shared/popover").PopoverState;

export default function ResultPopover() {
	const [state, setState] = useState<PopoverState>({ status: "idle" });
	const stateRef = useRef(state);
	stateRef.current = state;
	const [copied, setCopied] = useState(false);
	const cardRef = useRef<HTMLDivElement>(null);
	const tabInfoRef = useRef<TabFrameInfo | null>(null);

	// 1. Get own tab/frame ID on mount
	useEffect(() => {
		chrome.runtime.sendMessage({ type: "GET_TAB_ID" }, (res: TabInfoResponse) => {
			if (chrome.runtime.lastError || !res) return;
			tabInfoRef.current = { tabId: res.tabId, frameId: res.frameId };

			// Hydrate: check for a fresh request (and possibly an already-written result)
			// that may have arrived before we were ready to listen.
			chrome.storage.local.get([POPOVER_REQUEST_KEY, POPOVER_RESULT_KEY], (storage) => {
				const req = storage[POPOVER_REQUEST_KEY] as PopoverRequest | undefined;
				if (
					!req ||
					req.tabId !== res.tabId ||
					req.frameId !== res.frameId ||
					Date.now() - req.at >= 30000
				) {
					return;
				}
				const info = { tabId: res.tabId, frameId: res.frameId };
				const next = applyPopoverResult(
					{ status: "loading", request: req },
					storage[POPOVER_RESULT_KEY] as PopoverResult | undefined,
					info
				);
				stateRef.current = next;
				setState(next);
			});
		});
	}, []);

	// 2. Listen for storage changes (stable subscription; reads latest state via ref)
	useEffect(() => {
		const handleStorage = (changes: { [key: string]: chrome.storage.StorageChange }) => {
			const info = tabInfoRef.current;
			if (!info) return;
			const next = applyPopoverStorageChanges(stateRef.current, changes, info);
			if (next !== stateRef.current) {
				stateRef.current = next;
				setState(next);
			}
		};
		chrome.storage.onChanged.addListener(handleStorage);
		return () => chrome.storage.onChanged.removeListener(handleStorage);
	}, []);

	// 3. Handle dismissals
	const dismiss = useCallback(() => setState({ status: "idle" }), []);
	useEffect(() => {
		if (state.status === "idle") return;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") dismiss();
		};
		const handleMouseDown = (e: MouseEvent) => {
			if (cardRef.current && !e.composedPath().includes(cardRef.current)) {
				dismiss();
			}
		};
		const handleScroll = () => dismiss();

		document.addEventListener("keydown", handleKeyDown);
		document.addEventListener("mousedown", handleMouseDown);
		window.addEventListener("scroll", handleScroll, { capture: true });
		window.addEventListener("resize", handleScroll);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.removeEventListener("mousedown", handleMouseDown);
			window.removeEventListener("scroll", handleScroll, { capture: true });
			window.removeEventListener("resize", handleScroll);
		};
	}, [state.status, dismiss]);

	const placement = useMemo(() => {
		if (state.status === "idle") return null;
		return computePlacement(state.request.anchor, {
			width: window.innerWidth,
			height: window.innerHeight,
		});
	}, [state]);

	const handleCopy = useCallback(() => {
		if (state.status !== "done") return;
		navigator.clipboard
			.writeText(state.result)
			.then(() => {
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			})
			.catch(() => {
				// Fallback for strict environments
				const ta = document.createElement("textarea");
				ta.value = state.result;
				document.body.appendChild(ta);
				ta.select();
				try {
					document.execCommand("copy");
					setCopied(true);
					setTimeout(() => setCopied(false), 2000);
				} catch (err) {
					console.error("Copy failed", err);
				}
				document.body.removeChild(ta);
			});
	}, [state]);

	const handleRetry = useCallback(() => {
		if (state.status !== "error") return;
		triggerAiAction({
			action: state.request.action,
			text: state.request.text,
			anchor: state.request.anchor,
			source: state.request.source,
		});
	}, [state]);

	if (state.status === "idle" || !placement) return null;

	const { request } = state;
	const title = request.action === "explain" ? "Explain" : "Summarize";
	const Icon = request.action === "explain" ? Sparkles : FileText;

	return (
		<div
			ref={cardRef}
			className="fixed z-[99999] w-[360px] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150"
			style={{
				left: placement.left,
				top: placement.top,
				maxWidth: "calc(100vw - 24px)",
				width: `${POPOVER_WIDTH}px`,
			}}
			role="dialog"
			aria-label="AI result"
		>
			<div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-100 dark:border-slate-800">
				<div className="flex items-center gap-2">
					<Icon size={16} className="text-slate-500" />
					<h2 className="text-sm font-medium text-slate-800 dark:text-slate-200">{title}</h2>
				</div>
				<Button variant="ghost" size="icon" className="h-6 w-6" onClick={dismiss} aria-label="Close">
					<X size={16} />
				</Button>
			</div>

			<div className="p-3.5 text-sm" style={{ maxHeight: `${POPOVER_MAX_HEIGHT}px`, overflowY: "auto" }}>
				{state.status === "loading" && (
					<div className="flex items-center justify-center gap-2 text-slate-500 py-8">
						<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-500" />
						<span>{title}ing...</span>
					</div>
				)}
				{state.status === "done" && (
					<>
						<MessageContent text={state.result} />
						{state.truncated && (
							<p className="text-xs text-slate-400 mt-2">Input was trimmed</p>
						)}
					</>
				)}
				{state.status === "error" && (
					<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm flex flex-col gap-2">
						<span>{getErrorMessage(state.code)}</span>
						<Button
							variant="secondary"
							size="sm"
							onClick={handleRetry}
						>
							<RotateCcw size={14} className="mr-1.5" />
							Retry
						</Button>
					</div>
				)}
			</div>

			<div className="flex justify-between border-t border-slate-100 dark:border-slate-800 px-3.5 py-2">
				<Button variant="ghost" size="sm" onClick={handleCopy} disabled={state.status !== "done"}>
					{copied ? <Check size={16} className="mr-1.5 text-emerald-500" /> : <Copy size={16} className="mr-1.5" />}
					Copy
				</Button>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => chrome.runtime.sendMessage({ type: "OPEN_SIDEPANEL" })}
				>
					<MessagesSquare size={16} className="mr-1.5" />
					Open in chat
				</Button>
			</div>
		</div>
	);
}