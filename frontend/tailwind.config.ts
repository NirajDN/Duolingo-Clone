import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        duo: {
          green: "#58CC02",
          "green-shadow": "#46A302",
          blue: "#1CB0F6",
          "blue-shadow": "#1899D6",
          gold: "#FFC800",
          "gold-shadow": "#D7A700",
          red: "#FF4B4B",
          "red-shadow": "#EA2B2B",
          purple: "#CE82FF",
          "purple-shadow": "#A559D6",
          gray: "#E5E5E5",
          "gray-shadow": "#CECECE",
          "gray-text": "#777777",
          dark: "#131F24",
          "dark-card": "#1A2B32",
          "dark-border": "#37464F",
        },
      },
      fontFamily: {
        nunito: ['var(--font-nunito)', 'sans-serif'],
      },
      boxShadow: {
        'duo-3d': '0 4px 0 0 rgba(0, 0, 0, 0.2)',
      },
    },
  },
  plugins: [],
};

export default config;
