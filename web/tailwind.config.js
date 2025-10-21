/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'vibeen-dark': '#0a0e1a',
        'vibeen-accent': '#00d9ff',
        'vibeen-purple': '#a855f7',
        'vibeen-card': '#1a1f2e',
      },
    },
  },
  plugins: [],
}
