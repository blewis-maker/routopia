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
        neon: {
          green: {
            on: 'rgb(16,185,129)', // emerald-500
            off: 'rgb(4,120,87)', // emerald-600/70
          },
          teal: {
            on: 'rgb(45,212,191)', // teal-400
            off: 'rgb(17,94,89)', // teal-600/70
          },
          red: {
            on: 'rgb(239,68,68)', // red-500
            off: 'rgb(127,29,29)', // red-600/70
          },
          // Add more neon colors as needed
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'gradient-text': 'gradient-text 4s ease infinite',
        'pulse-neon': 'pulse-neon 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'gradient-text': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'pulse-neon': {
          '0%, 100%': {
            opacity: '1',
            filter: 'drop-shadow(0 0 4px var(--neon-glow))',
          },
          '50%': {
            opacity: '.7',
            filter: 'drop-shadow(0 0 2px var(--neon-glow))',
          },
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

