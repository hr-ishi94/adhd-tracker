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
          50: '#FAF4F8',
          100: '#F3E6EF',
          200: '#E8CFE0',
          300: '#D6ABC9',
          400: '#B978A5',
          500: '#90487B',
          600: '#5C2454', // ADHD-friendly Deep Plum (primary brand)
          700: '#4B1C44',
          800: '#3C1536',
          900: '#2F102A',
          950: '#1F0A1C',
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
        'glow': '0 0 25px rgba(92, 36, 84, 0.22)',
        'amber-glow': '0 0 25px rgba(245, 183, 0, 0.28)',
      }
    },
  },
  plugins: [],
}
