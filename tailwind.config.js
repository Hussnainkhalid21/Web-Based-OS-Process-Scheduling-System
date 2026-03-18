/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        process: {
          0: "#3b82f6", 1: "#10b981", 2: "#8b5cf6",
          3: "#f59e0b", 4: "#ec4899", 5: "#06b6d4",
        },
      },
    },
  },
  plugins: [],
};
