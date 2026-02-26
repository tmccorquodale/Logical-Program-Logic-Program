/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'nsw-blue': '#002664',
        'nsw-red': '#D7153A',
        'nsw-light-blue': '#2E8DCE',
        'nsw-grey': '#F2F2F2',
        'nsw-dark-grey': '#494949',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
