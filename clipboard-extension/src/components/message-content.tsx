import React, { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

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

const FENCE_RE = /```(\w+)?\n([\s\S]*?)```/g;

export function MessageContent({ text }: { text: string }) {
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
		return <span className="whitespace-pre-wrap break-words text-slate-800 dark:text-slate-200">{text}</span>;
	}

	return (
		<div className="space-y-2">
			{parts.map((part, i) =>
				part.type === "code" ? (
					<CodeBlock key={i} code={part.content} language={part.lang} />
				) : (
					<span key={i} className="whitespace-pre-wrap break-words text-slate-800 dark:text-slate-200">
						{part.content}
					</span>
				)
			)}
		</div>
	);
}