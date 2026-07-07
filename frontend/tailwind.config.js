/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2563eb",
        secondary: "#7c3aed",
        slateNight: "#0f172a",
        success: "#059669",
        warning: "#d97706",
        danger: "#dc2626",
      },
      spacing: {
        "section-y": "5rem",
        "card-p": "1.25rem",
        "toolbar-gap": "0.75rem",
      },
      fontSize: {
        "display-xl": ["clamp(2rem,4vw,3.5rem)", { lineHeight: "1.12", fontWeight: "900" }],
        "display-lg": ["clamp(1.5rem,3vw,2.25rem)", { lineHeight: "1.15", fontWeight: "900" }],
        "label-caps": ["0.6875rem", { lineHeight: "1.2", fontWeight: "800", letterSpacing: "0.16em" }],
      },
      fontFamily: {
        sans: [
          "Inter Variable",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      boxShadow: {
        glow: "0 24px 80px rgba(37, 99, 235, 0.22)",
        soft: "0 24px 80px rgba(15, 23, 42, 0.08)",
      },
      backgroundImage: {
        "premium-gradient":
          "linear-gradient(135deg, #2563eb 0%, #7c3aed 48%, #06b6d4 100%)",
        "radial-blue":
          "radial-gradient(circle at top left, rgba(37, 99, 235, 0.28), transparent 34%)",
      },
    },
  },
  plugins: [],
};
