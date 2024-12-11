import { colors } from './src/styles/tokens/colors';
import { typography } from './src/styles/tokens/typography';

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: colors.brand,
        surface: colors.surface,
        text: colors.text,
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'gradient-text': 'gradient-text 4s ease infinite',
      },
      keyframes: {
        'gradient-text': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      borderRadius: {
        DEFAULT: '0.5rem'
      }
    },
  },
  plugins: [
    function({ addComponents }) {
      addComponents({
        '.btn': {
          '@apply relative isolate overflow-hidden transition-all duration-200': {},
          '&:before': {
            content: '""',
            '@apply absolute inset-0 z-[-1]': {},
          }
        },
        '.glass-panel': {
          '@apply relative isolate overflow-hidden backdrop-blur-sm': {},
          '&:before': {
            content: '""',
            '@apply absolute inset-0 z-[-1]': {},
          }
        }
      });
    },
    require('tailwindcss-animate'),
  ]
};

