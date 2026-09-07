/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        heartbeat: 'heartbeat 1.2s ease-in-out infinite',
      },
      keyframes: {
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.12)' },
        },
      },
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
