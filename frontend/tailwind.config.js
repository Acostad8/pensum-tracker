/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ufpso: {
          // Rojo institucional UFPSO
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#dc2626",
          600: "#b91c1c",
          700: "#991b1b",
          800: "#7f1d1d",
          900: "#6b1717",
        },
        state: {
          approved: "#16a34a",
          approvedBg: "#dcfce7",
          pending: "#94a3b8",
          pendingBg: "#f1f5f9",
          available: "#0ea5e9",
          availableBg: "#e0f2fe",
          failed: "#ea580c",
          failedBg: "#ffedd5",
        },
      },
      fontFamily: {
        sans: ['"Inter"', "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};
