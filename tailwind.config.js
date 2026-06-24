/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ff0019',
        blue: {
          50: '#fff0f1',
          100: '#ffe0e2',
          200: '#ffbcc1',
          300: '#ff8a93',
          400: '#ff4d5a',
          500: '#ff1a2b',
          600: '#ff0019', // Mockup RED primary
          700: '#cc0014', // Mockup hover RED
          800: '#99000f',
          900: '#66000a',
          950: '#330005',
        }
      }
    },
  },
  plugins: [],
}
