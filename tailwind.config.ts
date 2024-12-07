import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ['var(--font-montserrat)', 'sans-serif'],
      },
      keyframes: {
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%, 100%': {
            filter: 'drop-shadow(0 0 8px rgba(45, 212, 191, 0.3))',
          },
          '50%': {
            filter: 'drop-shadow(0 0 20px rgba(45, 212, 191, 0.6))',
          },
        },
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
      animation: {
        'bounce-slow': 'bounce 2s ease-in-out infinite',
        'gradient-text': 'gradient-text 3s ease infinite',
        'logo-active': 'bounce 2s ease-in-out infinite, glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
