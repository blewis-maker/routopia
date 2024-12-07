import { TypographyScale, ColorToken } from './type-guards'

export const formatDistance = (meters: number): string => {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')} hr`;
  }
  return `${minutes} min`;
};

export const getTypographyClass = (scale: TypographyScale) => {
  const baseClasses = {
    xs: 'text-xs leading-4',
    sm: 'text-sm leading-5',
    base: 'text-base leading-6',
    lg: 'text-lg leading-7',
    xl: 'text-xl leading-7',
    '2xl': 'text-2xl leading-8',
    '3xl': 'text-3xl leading-9',
    '4xl': 'text-4xl leading-10',
    '5xl': 'text-5xl leading-none',
  }
  return baseClasses[scale]
}

export const getColorVar = (token: ColorToken) => {
  return `var(--${token})`
}

export const getResponsiveClasses = (baseClass: string) => {
  return {
    mobile: baseClass,
    tablet: `sm:${baseClass}`,
    desktop: `lg:${baseClass}`,
  }
}

export const combineClasses = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ')
} 