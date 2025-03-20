import "../style.css";
import type {
	PlasmoCSConfig,
	PlasmoGetOverlayAnchor,
	PlasmoWatchOverlayAnchor,
} from "plasmo";
import { useEffect, useState } from "react";

export const config: PlasmoCSConfig = {
	matches: ["<all_urls>"],
};

export const getStyle = async (shadowRoot: any) => {
	const style = document.createElement("style");
	style.textContent = `
    ::selection {
      background: rgba(0, 0, 0, 0.05) !important;
    }
  `;

	// Check the initial value of 'isOn'
	const result = await chrome.storage.local.get(["isOn"]);

	// If 'isOn' is true, apply styles
	if (result.isOn ?? true) {
		// Apply style to document head and shadow DOM
		if (!document.head.contains(style)) {
			document.head.appendChild(style); // Add to document head
		}
		shadowRoot.adoptedStyleSheets = [new CSSStyleSheet()];
		shadowRoot.adoptedStyleSheets[0].replaceSync(style.textContent); // Apply style to shadow DOM
	}

	// Listen for changes in 'isOn' and update the style dynamically
	chrome.storage.onChanged.addListener((changes, areaName) => {
		if (areaName === "local" && changes.isOn) {
			if (changes.isOn.newValue) {
				// Only add the style if 'isOn' is true
				if (!document.head.contains(style)) {
					document.head.appendChild(style); // Add to document head
				}
				shadowRoot.adoptedStyleSheets = [new CSSStyleSheet()];
				shadowRoot.adoptedStyleSheets[0].replaceSync(style.textContent); // Add to shadow DOM
			} else {
				// If 'isOn' is false, remove the style
				if (document.head.contains(style)) {
					document.head.removeChild(style); // Remove from document head
					shadowRoot.adoptedStyleSheets = []; // Remove from shadow DOM
				}
			}
		}
	});

	return style;
};

export const watchOverlayAnchor: PlasmoWatchOverlayAnchor = (
	updatePosition,
) => {
	const interval = setInterval(() => {
		updatePosition();
	}, 420);

	return () => clearInterval(interval);
};

export const getOverlayAnchor: PlasmoGetOverlayAnchor = async () =>
	// document.querySelector(`header > div > a[href="/"]`)
	document.querySelector(`html`);

const PlasmoPricingExtra = () => {
	const [Color, setColor] = useState<string>("#61afef");
	const [clipBoardText, setClipBoardText] = useState<string>("");
	const [isDisplay, setIsDisplay] = useState<boolean>(true);

	const handleClipboardRead = async () => {
		try {
			const value = await navigator.clipboard.readText(); // Wait for clipboard text
			setClipBoardText(value);
			console.log("Clipboard value:", value); // Log the text from the clipboard
		} catch (error) {
			console.error("Failed to read clipboard text:", error);
		}
	};

	function sleep(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
	chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
		if (request.type === "PENDING_COLOR") {
			setColor("#FF0000");
		}
		if (request.type === "SUCCESS_COLOR") {
			setColor("#00FF00");
			handleClipboardRead();
			sleep(2000).then(() => {
				setColor("#61afef");
			});
		}
	});
	const [isHover, setIsHover] = useState(false);

	const handleMouseEnter = () => {
		setIsHover(true);
	};
	const handleMouseLeave = () => {
		setIsHover(false);
	};

	// Listen for changes in 'isOn' and update the style dynamically
	chrome.storage.onChanged.addListener((changes, areaName) => {
		if (areaName === "local" && changes.isOn) {
			if (changes.isOn) {
				setIsDisplay(!!changes.isOn.newValue);
			}
		}
	});

	useEffect(() => {
		async function Display() {
			// const result = await chrome.storage.local.get(["isOn"]);
			new Promise((resolve) => {
				chrome.storage.local.get(["isOn"], (data) => {
					console.log(data);
					setIsDisplay(data.isOn);
					resolve(data);
				});
			});
		}
		Display();
	}, []);

	return (
		<>
			{isDisplay && (
				<div
					style={{
						width: "100vw",
						display: "flex",
						flexDirection: "column",
						bottom: 0,
						position: "fixed",
						pointerEvents: isHover ? "none" : "auto",
					}}
				>
					<div
						onMouseEnter={handleMouseEnter}
						onMouseLeave={handleMouseLeave}
						style={{
							width: "99%",
							display: "flex",
							justifyContent: "space-between",
							alignSelf: "center",
							height: "30px",
							padding: "10px",
							alignItems: "center",
						}}
					>
						<div
							style={{
								borderRadius: 100,
								padding: 4,
								backgroundColor: Color,
								width: "1px",
								height: "1px",
								zIndex: 100,
								boxShadow: "0 0 5px 0 rgba(0, 0, 0, 0.3)",
								scale: "0.5",
							}}
						></div>
						<div
							style={{
								width: "60%",
								color: isHover ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0)",
								fontSize: "10px",
								marginLeft: "10px",
								textAlign: "right",
								verticalAlign: "bottom",
								display: "inline-block",
							}}
						>
							{clipBoardText}
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default PlasmoPricingExtra;
