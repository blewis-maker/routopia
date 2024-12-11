"use client"

import { forwardRef } from 'react';
import { baseStyles, roundedStyles, glassStyles } from '@/styles/components';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  rounded?: keyof typeof roundedStyles;
  glass?: boolean;
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  variant = 'solid',
  size = 'md',
  rounded = 'lg',
  glass = false,
  isLoading = false,
  children,
  ...props
}, ref) => {
  const variants = {
    solid: 'bg-teal-500 hover:bg-teal-600 text-white',
    outline: 'border border-stone-800 hover:bg-stone-800/10',
    ghost: 'hover:bg-stone-800/10',
    glass: cn(glassStyles.dark, 'text-stone-400 hover:text-stone-200')
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      ref={ref}
      className={cn(
        baseStyles.button,
        variants[variant],
        sizes[size],
        roundedStyles[rounded],
        glass && glassStyles.dark,
        isLoading && 'opacity-50 cursor-wait',
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {isLoading && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </span>
    </button>
  );
});

Button.displayName = 'Button';