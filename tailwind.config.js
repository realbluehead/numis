/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        amazon: {
          bg: '#0f1419',
          surface: '#1a1e2e',
          card: '#232f3e',
          border: '#37475a',
          text: '#e0e0e0',
          textLight: '#ffffff',
          textMuted: '#999999',
          orange: '#FF9900',
          orangeHover: '#FF8C00',
          orangeActive: '#E8860F',
          success: '#2ecc71',
          danger: '#e74c3c',
          warning: '#f39c12',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(15, 20, 25, 0.1)',
        sm: '0 1px 3px 0 rgba(15, 20, 25, 0.12)',
        md: '0 4px 6px -1px rgba(15, 20, 25, 0.15)',
        lg: '0 10px 15px -3px rgba(15, 20, 25, 0.2)',
      },
    },
  },
  plugins: [],
};
