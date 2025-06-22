import type { Config } from "tailwindcss";
import tailwindForms from "@tailwindcss/forms";

export default {
  darkMode: ["class", '[data-mode="dark"]'],
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx,html}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Inter"',
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
      },

      screens: {
        xs: "350px",
      },
    },
  },
  plugins: [tailwindForms],
} satisfies Config;
