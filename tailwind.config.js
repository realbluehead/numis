/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        velvet: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d9ff',
          300: '#a3c4ff',
          400: '#7da8ff',
          500: '#5b8cff',
          600: '#4169ff',
          700: '#2d4dd9',
          800: '#1e3a8a',
          900: '#3a5a8f',
          950: '#0a0f1f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Poppins', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 20px rgba(30, 58, 138, 0.12)',
        gentle: '0 8px 32px rgba(30, 58, 138, 0.15)',
        dreamy: '0 12px 40px rgba(93, 140, 255, 0.15)',
      },
    },
  },
  plugins: [],
};
