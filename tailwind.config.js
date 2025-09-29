import { defineConfig } from '@tailwindcss/vite'

export default defineConfig({
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Sepia palette for sticky-note style UI
        sepia: {
          50: '#FFF8E7',
          100: '#FDECCB',
          200: '#F8DEAC',
          300: '#F2CF8E',
          400: '#E8BF6B',
          500: '#DFA54F',
          600: '#C4843C',
          700: '#9B642E',
          800: '#734A22',
          900: '#4D3116',
        },
        yellow: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        primary: '#E8BF6B',
        accent: '#F8DEAC',
        'zama-light-orange': '#fde68a',
        'zama-dark': '#1a1a1a',
        'card-dark': '#232323',
        'text-primary-dark': '#3B2F2F',
        'text-secondary-dark': '#5B4A3A',
        'border-dark': '#E9D8B4',
        'text-secondary': '#4A3F35',
      },
      animation: {
        'in': 'slideIn 0.2s ease-out',
        'slide-in-from-right': 'slideInFromRight 0.3s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInFromRight: {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
});