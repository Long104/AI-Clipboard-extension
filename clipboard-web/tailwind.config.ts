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
        canvas: "var(--canvas)",
        surface: {
          DEFAULT: "var(--surface)",
          elevated: "var(--surface-elevated)",
          card: "var(--surface-card)",
        },
        hairline: {
          DEFAULT: "var(--hairline)",
          soft: "var(--hairline-soft)",
          strong: "var(--hairline-strong)",
        },
        ink: {
          DEFAULT: "var(--ink)",
          body: "var(--body)",
          charcoal: "var(--charcoal)",
          mute: "var(--mute)",
          ash: "var(--ash)",
          stone: "var(--stone)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
          pressed: "var(--primary-pressed)",
          fg: "var(--on-primary)",
        },
        accent: {
          blue: "var(--accent-blue)",
          "blue-soft": "var(--accent-blue-soft)",
          green: "var(--accent-green)",
          "green-soft": "var(--accent-green-soft)",
          amber: "var(--accent-amber)",
          "amber-soft": "var(--accent-amber-soft)",
          red: "var(--accent-red)",
          "red-soft": "var(--accent-red-soft)",
        },
        keycap: {
          start: "var(--keycap-start)",
          end: "var(--keycap-end)",
        },
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "'SF Pro Display'", "'SF Pro Text'", "'Segoe UI'", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "'SF Mono'", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      fontSize: {
        "caption-md": ["13px", { lineHeight: "1.4", letterSpacing: "0.1px" }],
        "caption-sm": ["12px", { lineHeight: "1.5", letterSpacing: "0.4px" }],
      },
      borderRadius: {
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        full: "var(--radius-full)",
      },
      spacing: {
        section: "var(--section-y)",
        "container-max": "var(--container-max)",
        "container-px": "var(--container-px)",
      },
      boxShadow: {
        // Spec exception: the ONLY shadow allowed — floating popover mockup in hero
        popover: "0 20px 40px -15px rgba(15,23,42,0.08), 0 8px 16px -8px rgba(15,23,42,0.06), 0 0 0 1px rgba(15,23,42,0.06)",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        "accordion-up": "accordion-up 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
} satisfies Config;
