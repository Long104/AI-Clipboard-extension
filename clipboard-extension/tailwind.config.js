/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: "class",
	content: [
		"./src/contents/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/newtab/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/options/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/popup/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/sidepanel/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				// shadcn-style base tokens
				background: "#FFFFFF",
				foreground: "#0F172A",
				card: "#FFFFFF",
				"card-foreground": "#0F172A",
				muted: "#F8FAFC",
				"muted-foreground": "#64748B",
				accent: "#6366F1",
				"accent-foreground": "#FFFFFF",
				destructive: "#EF4444",
				"destructive-foreground": "#FFFFFF",
				ring: "#3B82F6",
				input: "#E2E8F0",
				// design spec semantic tokens
				primary: {
					DEFAULT: "#3B82F6",
					foreground: "#FFFFFF",
				},
				secondary: {
					DEFAULT: "#10B981",
					foreground: "#FFFFFF",
				},
				tertiary: {
					DEFAULT: "#6366F1",
					foreground: "#FFFFFF",
				},
				neutral: {
					DEFAULT: "#64748B",
					foreground: "#FFFFFF",
				},
				surface: {
					DEFAULT: "#F8FAFC",
					foreground: "#0F172A",
				},
				border: {
					DEFAULT: "#E2E8F0",
					accent: "#94A3B8",
				},
				error: {
					DEFAULT: "#EF4444",
					foreground: "#FFFFFF",
				},
				warning: {
					DEFAULT: "#F59E0B",
					foreground: "#FFFFFF",
				},
				success: {
					DEFAULT: "#10B981",
					foreground: "#FFFFFF",
				},
				info: {
					DEFAULT: "#3B82F6",
					foreground: "#FFFFFF",
				},
			},
			fontFamily: {
				sans: ["Geist", "system-ui", "-apple-system", "sans-serif"],
				mono: ["Geist Mono", "monospace"],
			},
			borderRadius: {
				sm: "8px",
				md: "12px",
				lg: "16px",
				xl: "24px",
			},
		},
	},
	plugins: [require("tailwindcss-animate")],
};
