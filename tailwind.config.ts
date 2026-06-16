import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#05070A",
        signal: "#00FFF0",
        trace: "#3B82F6",
        spark: "#7DF9FF",
        paper: "#F5F7FA",
        copper: "#C9824E",
        muted: "#7C8798",
        panel: "#0B1118",
        edge: "#16202C",
      },
      fontFamily: {
        display: ["'Space Grotesk Variable'", "system-ui", "sans-serif"],
        body: ["'Inter Variable'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
