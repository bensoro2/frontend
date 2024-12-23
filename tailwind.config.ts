import type { Config } from "tailwindcss";
import { nextui } from "@nextui-org/react";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        light: {
          colors: {
            background: "#FFFFFF",
            foreground: "#11181C",
            primary: {
              DEFAULT: "#006FEE",
              foreground: "#FFFFFF",
            },
          },
        },
        dark: {
          colors: {
            background: "#000000",
            foreground: "#ECEDEE",
            primary: {
              DEFAULT: "#006FEE",
              foreground: "#FFFFFF",
            },
          },
        },
      },
    }),
  ],
};

export default config;
