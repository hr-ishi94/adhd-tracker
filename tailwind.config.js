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
        // Primary: warm sunset orange (buttons, active states)
        focus: {
          50: '#FFF5EC',
          100: '#FFE7D1',
          200: '#FDCBA1',
          300: '#F9A86B',
          400: '#F38B45',
          500: '#EC7430',
          600: '#E0621F',
          700: '#BA4D17',
          800: '#943D17',
          900: '#773416',
          950: '#401808',
        },
        // Deep forest green (habit breaker surface, charts, success)
        forest: {
          50: '#EEF3EC',
          100: '#DCE7D8',
          200: '#B9CFB1',
          300: '#8FB085',
          400: '#6B925F',
          500: '#537A48',
          600: '#416139',
          700: '#344E2F',
          800: '#2A3F28',
          900: '#213322',
          950: '#152217',
        },
        // Honey cards (priority tickets)
        honey: {
          50: '#FFF9EA',
          100: '#FDEFC9',
          200: '#FBE3A6',
          300: '#F6CF72',
          400: '#F0B84A',
          500: '#E39E2A',
        },
        amber: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F5B700', // ADHD-friendly Warm Amber
          600: '#D99B00',
          700: '#B47B00',
          800: '#925F05',
          900: '#784D09',
        },
        dino: {
          plum: '#5C2454',
          amber: '#F5B700',
          tummy: '#E8CFE0',
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
        // Cream paper + cocoa ink neutrals
        warm: {
          50: '#FBF6EC',
          100: '#F6EEDF',
          200: '#EDE1CB',
          300: '#DDCCAE',
          400: '#BBA686',
          500: '#917C60',
          600: '#6E5B45',
          700: '#4E3F30',
          800: '#33291F',
          850: '#271F18',
          900: '#1D1712',
          950: '#110D0A'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(86, 60, 30, 0.06)',
        'lifted': '0 10px 30px rgba(86, 60, 30, 0.12)',
        'glow': '0 8px 24px rgba(224, 98, 31, 0.32)',
        'amber-glow': '0 0 25px rgba(245, 183, 0, 0.28)',
      }
    },
  },
  plugins: [],
}
