import "@/style.css";

import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Sparkles, KeyRound, Settings } from "lucide-react";
import type { ExtensionRequest } from "@/shared/messages";

function IndexPopup() {
	const [isOn, setIsOn] = useState(true);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Toggle the switch and update storage
	const toggleSwitch = async () => {
		const newState = !isOn;
		setIsOn(newState); // Optimistic UI update

		const message: ExtensionRequest = { type: "TOGGLE_SWITCH", isOn: newState };
		chrome.runtime.sendMessage(message, () => {
			if (chrome.runtime.lastError) {
				setError("Failed to update setting. Please try again.");
				setIsOn(!newState); // Revert optimistic update on failure
			}
		});
	};

	const openSidePanel = async () => {
		try {
			// Firefox uses sidebarAction, Chrome uses sidePanel
			if (globalThis.browser?.sidebarAction) {
				await globalThis.browser.sidebarAction.open();
				window.close();
				return;
			}
			const [currentTab] = await chrome.tabs.query({
				active: true,
				currentWindow: true,
			});
			if (currentTab.windowId) {
				const sidePanelApi = (
					chrome as unknown as {
						sidePanel?: { open: (opts: { windowId?: number }) => Promise<void> | void };
					}
				).sidePanel;
				await sidePanelApi?.open({ windowId: currentTab.windowId });
				window.close();
			}
		} catch (e) {
			setError("Could not open side panel.");
		}
	};

	useEffect(() => {
		// Retrieve initial value from storage on mount
		(async () => {
			try {
				const result = await new Promise<{ isOn?: boolean }>((resolve) => {
					chrome.storage.local.get(["isOn"], resolve);
				});
				const storedIsOn = result.isOn ?? true; // Default to true if not set
				setIsOn(storedIsOn);
			} catch (e) {
				setError("Could not load initial state.");
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	return (
		<div className="min-w-[280px] p-5 bg-white dark:bg-slate-900">
			{loading ? (
				<div className="flex flex-col items-center gap-3 py-6">
					<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
					<div className="text-sm text-slate-500">Loading...</div>
				</div>
			) : error ? (
				<div className="text-red-500 text-center text-sm py-4">{error}</div>
			) : (
				<div className="flex flex-col items-center gap-5">
					{!isOn ? (
						<div className="flex flex-col items-center gap-4 text-center">
							<div className="w-16 h-16 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full">
								<Sparkles
									size={32}
									className="text-slate-500 dark:text-slate-400"
								/>
							</div>
							<h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
								AI Clipboard is Paused
							</h2>
							<p className="text-sm text-slate-500 dark:text-slate-400 -mt-2">
								Enable the extension to get instant AI explanations.
							</p>
							<Button
								onClick={toggleSwitch}
								className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl h-11 shadow-sm flex items-center justify-center gap-2"
								aria-label="Enable AI Clipboard extension"
							>
								Enable Extension
							</Button>
						</div>
					) : (
						<>
							{/* Status header */}
							<div className="flex w-full items-center justify-between">
								<div className="flex items-center gap-2">
									<span
										className={`w-2 h-2 rounded-full ${
											isOn
												? "bg-emerald-500 animate-pulse"
												: "bg-slate-300 dark:bg-slate-600"
										}`}
									/>
									<span className="text-sm font-medium text-slate-900 dark:text-slate-100">
										Extension Enabled
									</span>
								</div>
								<Switch
									checked={isOn}
									onCheckedChange={toggleSwitch}
									aria-label="Toggle AI Clipboard extension on or off"
								/>
							</div>

							{/* Quick launcher */}
							<Button
								onClick={openSidePanel}
								className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl h-11 shadow-sm flex items-center justify-center gap-2"
								aria-label="Open AI Clipboard sidepanel"
							>
								<Sparkles size={16} />
								Open AI Clipboard
							</Button>

							{/* Footer metadata */}
							<div className="flex w-full items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-3">
								<span className="text-xs text-slate-500 dark:text-slate-400">
									Usage: 0/10
								</span>
								<div className="flex items-center gap-2">
									<Button
										variant="ghost"
										size="sm"
										className="h-7 w-7 p-0"
										onClick={() => chrome.runtime.openOptionsPage()}
										aria-label="Open settings"
									>
										<Settings size={12} />
									</Button>
									<span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-md px-2 py-1">
										<KeyRound size={11} />
										Alt+C
									</span>
								</div>
							</div>
						</>
					)}
				</div>
			)}
		</div>
	);
}

export default IndexPopup;
