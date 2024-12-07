import { montserrat, inter } from '@/app/fonts'

export const typography = {
  fonts: {
    primary: montserrat.style.fontFamily,
    secondary: inter.style.fontFamily,
  },
  scale: {
    // Font sizes using modern fluid type scale
    xs: 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
    sm: 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',
    base: 'clamp(1rem, 0.925rem + 0.375vw, 1.125rem)',
    lg: 'clamp(1.125rem, 1rem + 0.625vw, 1.25rem)',
    xl: 'clamp(1.25rem, 1.125rem + 0.625vw, 1.5rem)',
    '2xl': 'clamp(1.5rem, 1.375rem + 0.625vw, 1.875rem)',
    '3xl': 'clamp(1.875rem, 1.75rem + 0.625vw, 2.25rem)',
    '4xl': 'clamp(2.25rem, 2rem + 1.25vw, 3rem)',
    '5xl': 'clamp(3rem, 2.75rem + 1.25vw, 4rem)',
  },
  weight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} 