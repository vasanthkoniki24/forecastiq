/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["IBM Plex Sans", "Inter", "sans-serif"],
        display: ["DM Serif Display", "serif"],
        mono: ["JetBrains Mono", "monospace"]
      },
      colors: {
        primaryBg: "#080C14",
        secondaryBg: "#0D1525",
        glass: "rgba(255,255,255,0.04)",
        cyan: "#00D4FF",
        success: "#00E5A0",
        warning: "#FFB347",
        danger: "#FF4D6D",
        textMain: "#F0F4FF",
        textMuted: "#5A6A8A",
        borderSubtle: "rgba(0,212,255,0.12)"
      },
      boxShadow: {
        glow: "0 0 30px rgba(0,212,255,0.16)"
      }
    }
  },
  plugins: []
};