import "@/style.css";
import "@mantine/core/styles.css";

import { useEffect, useState } from "react";
import { Button, Loader, MantineProvider } from "@mantine/core";
import But from "@/components/button";
import { theme } from "@/shared/theme";
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
		<MantineProvider theme={theme}>
			<div className="min-w-64 min-h-48 flex flex-col items-center justify-center gap-6 p-4 bg-white dark:bg-gray-800">
				{loading ? (
					<Loader />
				) : error ? (
					<div className="text-red-500 text-center">{error}</div>
				) : (
					<>
						<But isOn={isOn} toggleSwitch={toggleSwitch} />
						<Button
							onClick={openSidePanel}
							variant="light"
							radius="xl"
							color="cyan"
							size="md"
							aria-label="Open clipboard history sidepanel"
						>
							Clipboard History
						</Button>
					</>
				)}
			</div>
		</MantineProvider>
	);
}

export default IndexPopup;
