import type { Config } from "tailwindcss";
import tailwindForms from "@tailwindcss/forms";

export default {
  darkMode: ["class", '[data-mode="dark"]'],
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
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
