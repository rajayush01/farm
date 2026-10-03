/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        barn: {
          DEFAULT: '#1F2B1E',
          50: '#EEF1EC',
          100: '#D7DED3',
          200: '#AFBEA8',
          300: '#879D7C',
          400: '#5F7C51',
          500: '#3C5A3E',
          600: '#2C4A2D',
          700: '#1F2B1E',
          800: '#161F16',
          900: '#0E140E',
        },
        parchment: {
          DEFAULT: '#F6F3EA',
          dim: '#EFEADB',
        },
        grain: {
          DEFAULT: '#E8C468',
          dark: '#C9A34C',
        },
        alert: {
          DEFAULT: '#9A2B1F',
          light: '#F4DBD6',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        body: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        ledger: '0 1px 0 0 rgba(31,43,30,0.12)',
      },
    },
  },
  plugins: [],
}
