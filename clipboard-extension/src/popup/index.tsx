import "@/style.css";
import { useEffect, useState } from "react";
import { Button, MantineProvider } from "@mantine/core";
import But from "@/components/button";
import "@mantine/core/styles.css";

function IndexPopup() {
	const [isOn, setIsOn] = useState(true);

	// Toggle the switch and update storage
	const toggleSwitch = async () => {
		const newState = !isOn;
		setIsOn(newState); // Update UI state

		chrome.runtime.sendMessage({ type: "TOGGLE_SWITCH", isOn: newState, highlight: "Highlight" });
	};

	const toggleHistory = async () => {
		chrome.windows.getCurrent({ populate: true }, (window) => {
			const sidePanelApi = (chrome as unknown as { sidePanel?: { open: (opts: { windowId?: number }) => Promise<void> | void } }).sidePanel;
			sidePanelApi?.open({ windowId: window.id });
		});

		window.close();
	};

	useEffect(() => {
		// Retrieve initial value from storage on mount
		(async () => {
			const result = await new Promise<{ isOn?: boolean }>((resolve) => {
				chrome.storage.local.get(["isOn"], resolve);
			});

			const storedIsOn = result.isOn ?? true; // Default to true if not set
			setIsOn(storedIsOn);
		})();
	}, []);

	return (
		<MantineProvider>
			<>
				<div className="min-w-64 min-h-64 flex flex-col items-center justify-center gap-6 p-4">
					<But isOn={isOn} toggleSwitch={toggleSwitch} />
					<Button
						onClick={toggleHistory}
						variant="light"
						radius="xl"
						color="cyan"
						size="md"
						aria-label="Open clipboard history sidepanel"
					>
						Clipboard History
					</Button>
				</div>
			</>
		</MantineProvider>
	);
}

export default IndexPopup;
