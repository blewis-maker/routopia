import { TypographyScale } from './type-guards';

export function getTypographyClass(scale: TypographyScale): string {
  const baseClasses = {
    'xs': 'text-xs',
    'sm': 'text-sm',
    'base': 'text-base',
    'lg': 'text-lg',
    'xl': 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
    '5xl': 'text-5xl',
  };

  return baseClasses[scale];
}

export function combineClasses(...classes: string[]): string {
  return classes.filter(Boolean).join(' ');
} 