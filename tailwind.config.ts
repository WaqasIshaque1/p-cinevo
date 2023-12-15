import { allThemes, defaultTheme, safeThemeList } from "./themes";
import type { Config } from "tailwindcss"

const themer = require("tailwindcss-themer");

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  safelist: safeThemeList,
  theme: {
    extend: {
      /* fonts */
      fontFamily: {
        "open-sans": "'Open Sans'"
      },

      /* animations */
      keyframes: {
        "loading-pin": {
          "0%, 40%, 100%": { height: "0.5em", "background-color": "#282336" },
          "20%": { height: "1em", "background-color": "white" }
        }
      },
      animation: { "loading-pin": "loading-pin 1.8s ease-in-out infinite" }
    }
  },
  plugins: [
    require("tailwind-scrollbar"),
    themer({
      defaultTheme: defaultTheme,
      themes: [
        {
          name: "default",
          selectors: [".theme-default"],
          ...defaultTheme,
        },
        ...allThemes]
    })
  ]
};

export default config;
