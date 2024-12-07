import type { Config } from "tailwindcss";
import { tokens } from './src/styles/tokens';

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./.storybook/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.stories.{js,ts,jsx,tsx}"
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        neutral: tokens.colors.neutral,
        brand: {
          primary: tokens.colors.brand.primary,
          secondary: tokens.colors.brand.secondary,
        },
        surface: {
          light: tokens.colors.surface.light,
          dark: tokens.colors.surface.dark,
        },
        text: {
          light: tokens.colors.text.light,
          dark: tokens.colors.text.dark,
        },
        state: tokens.colors.state,
      },
      fontFamily: {
        primary: [...tokens.typography.fonts.primary],
        secondary: [...tokens.typography.fonts.secondary],
        mono: [...tokens.typography.fonts.mono],
      },
      fontSize: Object.entries(tokens.typography.scale).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: Array.isArray(value) ? [...value] : value,
      }), {}),
      fontWeight: Object.entries(tokens.typography.weight).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: String(value),
      }), {}),
      lineHeight: tokens.typography.lineHeight,
      letterSpacing: tokens.typography.letterSpacing,
      borderRadius: {
        'sm': '0.375rem',
        DEFAULT: '0.5rem',
        'md': '0.625rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      },
      animation: {
        'gradient-text': 'gradient-text 8s ease infinite',
      },
      keyframes: {
        'gradient-text': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
  safelist: [
    {
      pattern: /^(bg|text|border|ring)-(neutral|brand|surface|text|state)-/,
      variants: ['hover', 'focus', 'dark'],
    },
    {
      pattern: /^(w|h)-/,
      variants: ['hover', 'focus', 'group-hover'],
    },
    {
      pattern: /^(rotate|scale|translate)-/,
      variants: ['hover', 'group-hover'],
    },
  ],
};

export default config;
