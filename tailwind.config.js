/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hockey-blue': '#003f7f',
        'hockey-red': '#c8102e',
        'ice-blue': '#e6f3ff',
      },
      fontFamily: {
        'hockey': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}