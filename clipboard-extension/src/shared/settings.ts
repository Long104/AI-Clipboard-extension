export type UsageMode = "free" | "byo";

export interface ExtensionSettings {
	apiKey: string; // "" when unused
	usageMode: UsageMode;
	overlayEnabled: boolean;
	captureOnCopy: boolean;
}

export const DEFAULT_SETTINGS: ExtensionSettings = {
	apiKey: "",
	usageMode: "free",
	overlayEnabled: true,
	captureOnCopy: true,
};

/** Field-wise defensive merge; invalid/unknown values fall back to defaults. Never throws. */
export function parseSettings(value: unknown): ExtensionSettings {
	if (typeof value !== "object" || value === null) {
		return DEFAULT_SETTINGS;
	}

	const input = value as Partial<ExtensionSettings>;

	const apiKey = typeof input.apiKey === "string" ? input.apiKey : DEFAULT_SETTINGS.apiKey;
	const usageMode =
		input.usageMode === "free" || input.usageMode === "byo"
			? input.usageMode
			: DEFAULT_SETTINGS.usageMode;
	const overlayEnabled =
		typeof input.overlayEnabled === "boolean"
			? input.overlayEnabled
			: DEFAULT_SETTINGS.overlayEnabled;
	const captureOnCopy =
		typeof input.captureOnCopy === "boolean"
			? input.captureOnCopy
			: DEFAULT_SETTINGS.captureOnCopy;

	return {
		apiKey,
		usageMode,
		overlayEnabled,
		captureOnCopy,
	};
}

export async function loadSettings(): Promise<ExtensionSettings> {
	try {
		const data = await new Promise<{ settings?: unknown }>((resolve) => {
			if (typeof chrome !== "undefined" && chrome.storage?.local) {
				chrome.storage.local.get("settings", resolve);
			} else {
				resolve({}); // Return empty object in non-extension envs
			}
		});
		return parseSettings(data?.settings);
	} catch (error) {
		console.error("Failed to load settings, falling back to defaults:", error);
		return DEFAULT_SETTINGS;
	}
}

export async function saveSettings(s: ExtensionSettings): Promise<void> {
	try {
		await new Promise<void>((resolve, reject) => {
			if (typeof chrome !== "undefined" && chrome.storage?.local) {
				chrome.storage.local.set({ settings: s }, () => {
					if (chrome.runtime.lastError) {
						reject(chrome.runtime.lastError);
					} else {
						resolve();
					}
				});
			} else {
				resolve(); // No-op in non-extension envs
			}
		});
	} catch (error) {
		console.error("Failed to save settings:", error);
	}
}

export function isByoActive(s: ExtensionSettings): boolean {
	return s.usageMode === "byo" && s.apiKey.trim().length > 0;
}
