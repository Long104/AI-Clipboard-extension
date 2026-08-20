import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "var(--bg-canvas)",
        surface: {
          1: "var(--bg-surface-1)",
          2: "var(--bg-surface-2)",
          3: "var(--bg-surface-3)",
          card: "var(--bg-surface-card)",
          popover: "var(--bg-surface-popover)",
        },
        hairline: {
          DEFAULT: "var(--border-hairline)",
          strong: "var(--border-hairline-strong)",
          hover: "var(--border-hairline-hover)",
        },
        ink: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)",
          disabled: "var(--text-disabled)",
        },
        lime: {
          DEFAULT: "var(--accent-lime)",
          hover: "var(--accent-lime-hover)",
          active: "var(--accent-lime-active)",
          fg: "var(--accent-lime-fg)",
          glow: "var(--accent-lime-glow)",
        },
        semantic: {
          green: "var(--semantic-green)",
          blue: "var(--semantic-blue)",
          amber: "var(--semantic-amber)",
          red: "var(--semantic-red)",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "-apple-system", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 35px -5px var(--accent-lime-glow)",
        card: "0 1px 2px 0 rgba(0, 0, 0, 0.4), 0 4px 12px 0 rgba(0, 0, 0, 0.2)",
        popover: "0 12px 36px -4px rgba(0, 0, 0, 0.6), 0 0 0 1px var(--border-hairline)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        full: "var(--radius-full)",
      },
      spacing: {
        "section-y": "var(--section-y)",
        "section-y-mobile": "var(--section-y-mobile)",
        "container-max": "var(--container-max)",
        "container-px": "var(--container-px)",
        "container-px-mobile": "var(--container-px-mobile)",
        "grid-gap": "var(--grid-gap)",
        "grid-gap-sm": "var(--grid-gap-sm)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "zoom-in-95": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        "accordion-up": "accordion-up 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-in": "fade-in 0.2s ease-out",
        "zoom-in-95": "zoom-in-95 0.2s ease-out",
      },
    },
  },
  plugins: [],
} satisfies Config;
