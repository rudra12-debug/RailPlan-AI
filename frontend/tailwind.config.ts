import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#011526",
        foreground: "#F8FAFC",
        chassis: {
          canvas: "#011526",
          card: "#022642",
          cardElev: "#033358",
          bay: "#000D18",
          border: "#000000",
          subtle: "#02395D",
        },
        solid: {
          mint: "#00FFD2",
          sky: "#2DC7D5",
          yellow: "#FFFF00",
          red: "#FF1818",
          rose: "#FB2077",
          violet: "#3D0072",
          cobalt: "#302BD1",
          navy: "#0000A2",
          indigo: "#6367FF",
          periwinkle: "#8595FF",
          lavender: "#CABFFF",
          petroleum: "#02395D",
          steel: "#387698",
          aquamarine: "#6FD2D8",
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'tactile-btn': '0 4px 0 #000000',
        'tactile-card': '4px 4px 0 #000000',
        'tactile-card-lg': '6px 6px 0 #000000',
        'tactile-badge': '2px 2px 0 #000000',
        'led-inset': 'inset 0 2px 5px rgba(0, 0, 0, 0.85)',
      },
    },
  },
  plugins: [],
};
export default config;
