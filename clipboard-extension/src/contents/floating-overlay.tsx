import type { PlasmoCSConfig } from "plasmo";
import React, { useState, useEffect, useCallback } from "react";
import { Sparkles, FileText, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { triggerAiAction } from "@/shared/popover";
import styleText from "data-text:@/style.css";
import { loadSettings, parseSettings } from "@/shared/settings";

export const config: PlasmoCSConfig = {
	matches: ["<all_urls>"],
	all_frames: true,
};

export const getStyle = () => {
	const style = document.createElement("style");
	style.textContent = styleText;
	return style;
};

export default function FloatingActionPill() {
	const [visible, setVisible] = useState(false);
	const [position, setPosition] = useState({ top: 0, left: 0 });
	const [anchor, setAnchor] = useState({ x: 0, y: 0 });
	const [copied, setCopied] = useState(false);
	const [selectedText, setSelectedText] = useState("");
	const [overlayEnabled, setOverlayEnabled] = useState(true);

	useEffect(() => {
		loadSettings().then((s) => setOverlayEnabled(s.overlayEnabled));
		const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
			if (changes.settings?.newValue) {
				setOverlayEnabled(parseSettings(changes.settings.newValue).overlayEnabled);
			}
		};
		chrome.storage.onChanged.addListener(listener);
		return () => chrome.storage.onChanged.removeListener(listener);
	}, []);

	const handleSelection = useCallback(() => {
		if (!overlayEnabled) {
			setVisible(false);
			return;
		}

		const selection = window.getSelection();
		const text = selection?.toString().trim() || "";

		if (text.length > 5) {
			const range = selection.getRangeAt(0);
			const rect = range.getBoundingClientRect();
			setSelectedText(text);
			setPosition({
				top: window.scrollY + rect.top - 50,
				left: window.scrollX + rect.left + rect.width / 2,
			});
			setAnchor({ x: rect.left + rect.width / 2, y: rect.bottom });
			setVisible(true);
		} else {
			setVisible(false);
		}
	}, [overlayEnabled]);

	useEffect(() => {
		document.addEventListener("mouseup", handleSelection);
		return () => {
			document.removeEventListener("mouseup", handleSelection);
		};
	}, [handleSelection]);

	const handleAction = (action: "explain" | "summarize" | "copy") => {
		setVisible(false);
		if (action === "copy") {
			navigator.clipboard.writeText(selectedText).then(() => {
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			});
			return;
		}

		triggerAiAction({
			action,
			text: selectedText,
			anchor,
			source: "selection",
		});
	};

	if (!visible) return null;

	return (
		<div
			className="fixed z-[99999] -translate-x-1/2 animate-in fade-in zoom-in-95 duration-150"
			style={{ top: position.top, left: position.left }}
		>
			<div className="flex items-center gap-1.5 rounded-full bg-slate-900/90 text-white backdrop-blur-md border border-slate-700/50 px-3 py-1.5 shadow-xl">
				<button
					onClick={() => handleAction("explain")}
					className="flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium text-slate-200 hover:bg-slate-800"
				>
					<Sparkles size={14} /> Explain
				</button>
				<div className="h-4 w-px bg-slate-700" />
				<button
					onClick={() => handleAction("summarize")}
					className="flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium text-slate-200 hover:bg-slate-800"
				>
					<FileText size={14} /> Summarize
				</button>
				<div className="h-4 w-px bg-slate-700" />
				<button
					onClick={() => handleAction("copy")}
					className="flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium text-slate-200 hover:bg-slate-800"
				>
					{copied ? <Check size={14} /> : <Copy size={14} />} Copy
				</button>
			</div>
		</div>
	);
}

