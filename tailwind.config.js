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
          50: '#fff5f1',
          100: '#ffe8df',
          200: '#ffd3c2',
          300: '#fca78e',
          400: '#fa8060',
          500: '#f26543',
          600: '#e14a27', // Pomo-Dino primary brand coral
          700: '#bc381b',
          800: '#9b3019',
          900: '#7f2c1a',
        },
        dino: {
          coral: '#f26543',
          tummy: '#ffd3c2',
          tomato: '#d63b2f',
          leaf: '#549646',
          rest: '#407835',
          navy: '#547290',
          lightMint: '#eaf4ee',
          cream: '#fdfcf9',
        },
        leaf: {
          50: '#f2f8f0',
          100: '#e2f0dc',
          200: '#c5e2bc',
          300: '#9dcd91',
          400: '#6fb260',
          500: '#549646',
          600: '#407835',
          700: '#345e2c',
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
