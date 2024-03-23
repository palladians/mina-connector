import defaultTheme from "tailwindcss/defaultTheme";
import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{svelte,js,ts}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Hanken Grotesk"', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [daisyui],
};
