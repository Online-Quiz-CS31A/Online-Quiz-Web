/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        root: {
        primary: '#3b82f6',
        primaryDark: '#1d4ed8',
        secondary: '#dbeafe',
        textDark: '#1e3a8a',
        textGray: '#4b5563',
        bgLight: '#f8f9fa'
        },
      }
    },
  },
  plugins: [],
}