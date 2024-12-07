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
  theme: {
    extend: {
      colors: {
        ...tokens.colors.brand,
        background: {
          primary: 'var(--background-primary)',
          secondary: 'var(--background-secondary)',
        },
      },
      fontFamily: {
        montserrat: tokens.typography.fonts.primary,
        sans: tokens.typography.fonts.secondary,
      },
      fontSize: tokens.typography.scale,
      fontWeight: {
        light: String(tokens.typography.weight.light),
        normal: String(tokens.typography.weight.normal),
        medium: String(tokens.typography.weight.medium),
        semibold: String(tokens.typography.weight.semibold),
        bold: String(tokens.typography.weight.bold),
      },
      lineHeight: {
        none: String(tokens.typography.lineHeight.none),
        tight: String(tokens.typography.lineHeight.tight),
        snug: String(tokens.typography.lineHeight.snug),
        normal: String(tokens.typography.lineHeight.normal),
        relaxed: String(tokens.typography.lineHeight.relaxed),
        loose: String(tokens.typography.lineHeight.loose),
      },
      letterSpacing: tokens.typography.letterSpacing,
    },
  },
  plugins: [],
};

export default config;
