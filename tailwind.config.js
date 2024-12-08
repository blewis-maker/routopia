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
        montserrat: typography.fonts.secondary,
        inter: typography.fonts.primary,
        sans: typography.fonts.primary,
        mono: typography.fonts.mono,
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
    },
  },
  plugins: [],
};

