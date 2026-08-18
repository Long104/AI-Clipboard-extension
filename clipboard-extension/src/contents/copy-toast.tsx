import type { PlasmoCSConfig } from "plasmo";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Check, FileText, Sparkles, X } from "lucide-react";

import styleText from "data-text:@/style.css";
import { cn } from "@/lib/utils";
import { triggerAiAction } from "@/shared/popover";
import {
	shouldCaptureCopy,
	TOAST_AUTO_DISMISS_MS,
	TOAST_CAPTURING_MS,
} from "@/shared/capture";
import { loadSettings, parseSettings, type ExtensionSettings } from "@/shared/settings";
import { Button } from "@/components/ui/button";

export const config: PlasmoCSConfig = {
	matches: ["<all_urls>"],
	all_frames: true,
};

export const getStyle = () => {
	const style = document.createElement("style");
	style.textContent = styleText;
	return style;
};

type ToastState = "idle" | "capturing" | "captured";

export default function CopyToast() {
	const [state, setState] = useState<ToastState>("idle");
	const [capturedText, setCapturedText] = useState("");
	const settingsRef = useRef<ExtensionSettings>();
	const dismissTimerRef = useRef<number>();
	const captureTimerRef = useRef<number>();

	const resetTimers = () => {
		if (captureTimerRef.current) clearTimeout(captureTimerRef.current);
		if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
	};

	const dismiss = useCallback(() => {
		resetTimers();
		setState("idle");
	}, []);

	useEffect(() => {
		loadSettings().then((s) => {
			settingsRef.current = s;
		});

		const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
			if (changes.settings?.newValue) {
				settingsRef.current = parseSettings(changes.settings.newValue);
			}
		};
		chrome.storage.onChanged.addListener(listener);
		return () => {
			chrome.storage.onChanged.removeListener(listener);
			resetTimers();
		};
	}, []);

	const handleCopy = useCallback(() => {
		const text = window.getSelection()?.toString();
		if (shouldCaptureCopy(text, settingsRef.current?.captureOnCopy ?? true)) {
			resetTimers();
			setCapturedText(text);
			setState("capturing");

			captureTimerRef.current = window.setTimeout(() => {
				setState("captured");
				dismissTimerRef.current = window.setTimeout(() => {
					dismiss();
				}, TOAST_AUTO_DISMISS_MS);
			}, TOAST_CAPTURING_MS);
		}
	}, [dismiss]);

	useEffect(() => {
		document.addEventListener("copy", handleCopy);
		return () => document.removeEventListener("copy", handleCopy);
	}, [handleCopy]);

	const handleAction = (action: "explain" | "summarize", e: React.MouseEvent) => {
		dismiss();
		triggerAiAction({
			action,
			text: capturedText,
			anchor: { x: e.clientX, y: e.clientY },
			source: "copy",
		});
	};

	if (state === "idle") {
		return null;
	}

	return (
		<div
			role="status"
			aria-live="polite"
			className="fixed top-4 right-4 z-[99999] w-80 animate-in fade-in slide-in-from-top-1 duration-150"
		>
			<div className="rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900 px-3.5 py-3">
				<div className="flex items-start justify-between">
					<div className="flex items-start gap-3">
						{state === "capturing" && (
							<div className="w-5 h-5 flex items-center justify-center">
								<div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
							</div>
						)}
						{state === "captured" && (
							<Check size={20} className="text-emerald-500" />
						)}
						<div className="flex flex-col gap-1.5">
							<span className="text-sm font-medium text-slate-800 dark:text-slate-200">
								{state === "capturing" ? "Capturing..." : "✓ Captured"}
							</span>

							{state === "captured" && (
								<div className="flex items-center gap-2">
									<Button
										variant="ghost"
										size="sm"
										className="h-auto px-2 py-1 text-xs"
										onClick={(e) => handleAction("explain", e)}
									>
										<Sparkles size={14} className="mr-1.5" />
										Explain
									</Button>
									<Button
										variant="ghost"
										size="sm"
										className="h-auto px-2 py-1 text-xs"
										onClick={(e) => handleAction("summarize", e)}
									>
										<FileText size={14} className="mr-1.5" />
										Summarize
									</Button>
								</div>
							)}
						</div>
					</div>
					<Button
						variant="ghost"
						size="icon"
						className="h-6 w-6 shrink-0 -mr-1 -mt-0.5"
						onClick={dismiss}
						aria-label="Dismiss"
					>
						<X size={16} />
					</Button>
				</div>
			</div>
		</div>
	);
}
