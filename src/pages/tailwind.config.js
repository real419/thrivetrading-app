/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#080e1a",      // Deep navy background from your logo[cite: 2]
          card: "#0f172a",      // Slightly lighter card/surface tone
          navy: "#1e293b",      // Secondary deep navy for containers
          primary: "#2563eb",   // Deep professional blue[cite: 2]
          royal: "#1d4ed8",     // Rich royal blue for active states
          accent: "#38bdf8",    // Vibrant cyan/sky blue from the upward arrow[cite: 2]
          sky: "#7dd3fc",       // Lighter sky blue for subtle highlights
          pure: "#ffffff",      // Crisp pure white[cite: 2]
          light: "#f8fafc",     // Off-white for main text[cite: 2]
          muted: "#94a3b8",     // Subdued grey-blue for secondary text[cite: 2]
        }
      }
    },
  },
  plugins: [],
}