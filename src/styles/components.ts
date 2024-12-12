import { cn } from '@/lib/utils';

export const baseStyles = {
  container: '',
  wrapper: cn(
    'bg-stone-950/80',
    'border border-stone-800/50',
    'backdrop-blur-md',
    'shadow-lg shadow-black/10',
    'rounded-lg'
  ),
  button: 'relative isolate overflow-hidden transition-all duration-200',
  input: 'relative isolate overflow-hidden transition-all duration-200',
  card: 'relative isolate overflow-hidden transition-all duration-200',
  panel: 'relative isolate overflow-hidden transition-all duration-200'
};

export const roundedStyles = {
  sm: 'rounded-md',
  md: 'rounded-lg',
  lg: 'rounded-xl',
  full: 'rounded-full'
};

export const glassStyles = {
  dark: 'bg-[#1B1B1B] border border-stone-800/90 backdrop-blur-sm',
  light: 'bg-white border border-stone-200/90 backdrop-blur-sm'
};

export const panelStyles = {
  dark: 'bg-stone-900 border border-stone-800/90',
  glass: 'bg-[#1B1B1B] border border-stone-800/90 backdrop-blur-sm'
};

export const inputStyles = {
  dark: 'focus:outline-none focus:ring-1 focus:ring-teal-500/30',
  light: 'focus:outline-none focus:ring-1 focus:ring-teal-500/30'
}; 