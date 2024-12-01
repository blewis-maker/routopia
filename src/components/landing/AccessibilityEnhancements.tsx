import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface AccessibleProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  description?: string;
}

export const AccessibleComponents = {
  Button: forwardRef<HTMLButtonElement, AccessibleProps>(
    ({ children, description, className = '', ...props }, ref) => {
      return (
        <button
          ref={ref}
          {...props}
          className={`
            focus:ring-2 focus:ring-teal-500 focus:outline-none
            focus:ring-offset-2 focus:ring-offset-stone-900
            ${className}
          `}
          aria-label={description}
          role="button"
        >
          {children}
        </button>
      );
    }
  ),

  Section: function AccessibleSection({ 
    title, 
    description, 
    children 
  }: { 
    title: string;
    description?: string;
    children: ReactNode;
  }) {
    return (
      <section
        aria-labelledby={`section-${title}`}
        className="relative"
      >
        <h2 
          id={`section-${title}`}
          className="sr-only"
        >
          {title}
        </h2>
        {description && (
          <p className="sr-only">{description}</p>
        )}
        {children}
      </section>
    );
  },

  SkipLink: function SkipToContent() {
    return (
      <a
        href="#main-content"
        className="
          sr-only focus:not-sr-only
          focus:fixed focus:top-4 focus:left-4
          bg-teal-500 text-white
          px-4 py-2 rounded-lg
          z-50
        "
      >
        Skip to main content
      </a>
    );
  }
}; 