/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        farm: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        earth: {
          50: '#fdfbf7',
          100: '#f7f2e8',
          200: '#eee2cf',
          300: '#e1cca9',
          400: '#d2b07e',
          500: '#c2965a',
          600: '#b07f4a',
          700: '#92633e',
          800: '#775037',
          900: '#614230',
        },
        accent: {
          amber: '#f59e0b',
          emerald: '#10b981',
          rose: '#f43f5e',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow': '0 0 20px rgba(34, 197, 94, 0.25)',
      }
    },
  },
  plugins: [],
}
