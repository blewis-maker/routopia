import { colors } from './src/styles/tokens/colors';
import { typography } from './src/styles/tokens/typography';

const styleGuide = {
  colors: {
    border: {
      primary: 'border-stone-800/50',
    },
    text: {
      primary: 'text-stone-200',
      secondary: 'text-stone-400',
      accent: 'text-teal-500'
    },
    background: {
      primary: 'bg-stone-950/80',
    }
  },
  effects: {
    glass: 'backdrop-blur-md',
    shadow: 'shadow-lg shadow-black/10',
  },
  typography: {
    base: 'font-sans antialiased',
    sizes: {
      xs: 'text-xs',
      sm: 'text-sm font-medium',
      base: 'text-base',
    }
  }
};

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
        '.glass-panel': {
          '@apply relative isolate overflow-hidden': {},
          '@apply bg-stone-950/80 backdrop-blur-md': {},
          '@apply border border-stone-800/50': {},
          '@apply shadow-lg shadow-black/10': {},
          '@apply rounded-lg': {},
          '@apply transition-all duration-200': {},
          '&:hover': {
            '@apply bg-stone-900/80 border-stone-700/60': {},
            '@apply shadow-lg shadow-black/15': {},
          },
          '&:focus': {
            '@apply outline-none ring-2 ring-teal-500/20': {},
          }
        },
        '.btn': {
          '@apply relative isolate overflow-hidden': {},
          '@apply px-4 py-2': {},
          '@apply text-sm font-medium': {},
          '@apply bg-stone-950/80 backdrop-blur-md': {},
          '@apply border border-stone-800/50': {},
          '@apply rounded-lg': {},
          '@apply transition-all duration-200': {},
          '@apply hover:bg-stone-900/80 hover:border-stone-700/60': {},
          '@apply hover:shadow-lg hover:shadow-black/15': {},
          '@apply active:translate-y-[1px]': {},
          '@apply focus:outline-none focus:ring-2 focus:ring-teal-500/20': {},
        }
      });
    },
    require('tailwindcss-animate'),
  ]
};

