/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f2f7f2',
          100: '#e1ede1',
          200: '#c5dcc5',
          300: '#9ec29e',
          400: '#71a272',
          500: '#4f8450',
          600: '#386641',
          700: '#2f5235',
          800: '#28432d',
          900: '#1b261e',
        }
      }
    },
  },
  plugins: [],
}
