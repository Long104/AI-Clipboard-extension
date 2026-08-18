import React, { useEffect, useState } from "react";
import "@/style.css";
import { Sparkles, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
	loadSettings,
	saveSettings,
	type ExtensionSettings,
} from "@/shared/settings";

export default function OptionsPage() {
	const [settings, setSettings] = useState<ExtensionSettings | null>(null);
	const [loading, setLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [saved, setSaved] = useState(false);
	const [showApiKey, setShowApiKey] = useState(false);
	const [saveTimer, setSaveTimer] = useState<ReturnType<typeof setTimeout>>();
	const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout>>();

	const load = async () => {
		setLoading(true);
		setLoadError(null);
		try {
			const s = await loadSettings();
			setSettings(s);
		} catch {
			setLoadError("Failed to load settings. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		load();
		return () => {
			if (saveTimer) clearTimeout(saveTimer);
			if (debounceTimer) clearTimeout(debounceTimer);
		};
	}, []);

	const flashSaved = () => {
		if (saveTimer) clearTimeout(saveTimer);
		setSaved(true);
		setSaveTimer(setTimeout(() => setSaved(false), 1500));
	};

	const update = (patch: Partial<ExtensionSettings>) => {
		if (!settings) return;
		const next = { ...settings, ...patch };
		setSettings(next);
		if (debounceTimer) clearTimeout(debounceTimer);
		setDebounceTimer(setTimeout(() => {
			saveSettings(next).then(flashSaved);
		}, 500));
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
			</div>
		);
	}

	if (loadError || !settings) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
				<div className="max-w-md w-full mx-auto p-6">
					<div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-400 flex flex-col gap-3">
						<span>{loadError || "Failed to load settings."}</span>
						<Button variant="secondary" size="sm" onClick={load} className="w-fit">
							Retry
						</Button>
					</div>
				</div>
			</div>
		);
	}

	const byoSelected = settings.usageMode === "byo";

	return (
		<div className="min-h-screen bg-white dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
			<div className="max-w-md mx-auto p-6">
				<div className="flex items-center gap-2 mb-6">
					<Sparkles size={18} className="text-blue-600" />
					<h1 className="text-lg font-semibold">AI Clipboard</h1>
					<span className="text-xs text-slate-400">Settings</span>
					{saved && (
						<span className="ml-auto text-xs text-emerald-600 dark:text-emerald-400">
							Saved ✓
						</span>
					)}
				</div>

				<div className="space-y-6">
					{/* AI Provider */}
					<section className="space-y-4">
						<h2 className="text-xs font-medium uppercase tracking-wider text-slate-400">
							AI Provider
						</h2>

						<div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-4">
							{/* Usage mode segmented control */}
							<div>
								<div className="text-sm font-medium mb-2">Usage mode</div>
								<div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-1 flex">
									<button
										type="button"
										onClick={() => update({ usageMode: "free" })}
										className={cn(
											"flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
											settings.usageMode === "free"
												? "bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-slate-100"
												: "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
										)}
									>
										Free — 10 requests / 2 h
									</button>
									<button
										type="button"
										onClick={() => update({ usageMode: "byo" })}
										className={cn(
											"flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
											settings.usageMode === "byo"
												? "bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-slate-100"
												: "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
										)}
									>
										Bring your own key
									</button>
								</div>
							</div>

							{/* API key row */}
							<div className={cn(!byoSelected && "opacity-50")}>
								<label
									htmlFor="api-key"
									className="block text-sm font-medium mb-1.5"
								>
									API key
								</label>
								<div className="relative">
									<input
										id="api-key"
										type={showApiKey ? "text" : "password"}
										value={settings.apiKey}
										disabled={!byoSelected}
										onChange={(e) => update({ apiKey: e.target.value })}
										placeholder="sk-…"
										className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm p-2.5 pr-10 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
									/>
									<button
										type="button"
										onClick={() => setShowApiKey((v) => !v)}
										disabled={!byoSelected}
										aria-label={showApiKey ? "Hide API key" : "Show API key"}
										className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:cursor-not-allowed"
									>
										{showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
									</button>
								</div>
								<p className="text-xs text-slate-400 mt-1.5">
									Stored only in this browser. Sent to the AI backend as
									X-Extension-Key.
								</p>
								{byoSelected && settings.apiKey.trim() === "" && (
									<p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5">
										Add a key to activate BYO mode.
									</p>
								)}
							</div>
						</div>
					</section>

					{/* Overlays */}
					<section className="space-y-4">
						<h2 className="text-xs font-medium uppercase tracking-wider text-slate-400">
							Overlays
						</h2>

						<div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-4">
							<div className="flex items-center justify-between">
								<div>
									<div className="text-sm font-medium">Selection pill</div>
									<p className="text-xs text-slate-400 mt-0.5">
										Show the action pill when you select text
									</p>
								</div>
								<Switch
									checked={settings.overlayEnabled}
									onCheckedChange={(checked) =>
										update({ overlayEnabled: checked })
									}
									aria-label="Toggle selection pill"
								/>
							</div>

							<div className="flex items-center justify-between">
								<div>
									<div className="text-sm font-medium">Capture on copy</div>
									<p className="text-xs text-slate-400 mt-0.5">
										Show a toast when you copy text
									</p>
								</div>
								<Switch
									checked={settings.captureOnCopy}
									onCheckedChange={(checked) =>
										update({ captureOnCopy: checked })
									}
									aria-label="Toggle capture on copy"
								/>
							</div>
						</div>
					</section>
				</div>
			</div>
		</div>
	);
}