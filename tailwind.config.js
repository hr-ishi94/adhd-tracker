/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        focus: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706', // primary confident accent for "Right Now"
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        warm: {
          50: '#FAF9F6',
          100: '#F5F2EB',
          200: '#EBE6DC',
          300: '#DBD4C5',
          400: '#B8AD9C',
          500: '#8E8270',
          600: '#645B4F',
          700: '#433D35',
          800: '#26221D',
          850: '#1C1916',
          900: '#151311',
          950: '#0C0B0A'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(0, 0, 0, 0.04)',
        'lifted': '0 8px 30px rgba(0, 0, 0, 0.08)',
        'glow': '0 0 25px rgba(217, 119, 6, 0.18)',
      }
    },
  },
  plugins: [],
}
