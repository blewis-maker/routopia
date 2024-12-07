import React from 'react';
import { TypographyScale } from '@/utils/type-guards';
import { getTypographyClass, combineClasses } from '@/utils/formatters';

interface BaseProps {
  children: React.ReactNode;
  className?: string;
}

interface TextProps extends BaseProps {
  variant?: TypographyScale;
  as?: keyof JSX.IntrinsicElements;
}

export const Text = ({ 
  variant = 'base',
  children,
  className = '',
  as: Component = 'p'
}: TextProps) => {
  return (
    <Component className={combineClasses(getTypographyClass(variant), className)}>
      {children}
    </Component>
  );
};

interface HeadingProps extends BaseProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  variant?: TypographyScale;
}

export const Heading = ({
  level,
  variant,
  children,
  className = '',
}: HeadingProps) => {
  // Default variants for each heading level if not specified
  const defaultVariants: Record<number, TypographyScale> = {
    1: '5xl',
    2: '4xl',
    3: '3xl',
    4: '2xl',
    5: 'xl',
    6: 'lg',
  };

  const Component = `h${level}` as keyof JSX.IntrinsicElements;
  const headingVariant = variant || defaultVariants[level];

  return (
    <Component className={combineClasses(
      getTypographyClass(headingVariant),
      'font-bold tracking-tight',
      className
    )}>
      {children}
    </Component>
  );
};

interface LinkProps extends BaseProps {
  href: string;
  variant?: TypographyScale;
  external?: boolean;
}

export const Link = ({
  href,
  external,
  children,
  className = '',
  variant = 'base',
}: LinkProps) => {
  const linkProps = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  
  return (
    <a
      href={href}
      className={combineClasses(
        getTypographyClass(variant),
        'text-brand-primary hover:text-brand-primary/80 transition-colors',
        className
      )}
      {...linkProps}
    >
      {children}
    </a>
  );
};

interface EmphasisProps extends BaseProps {
  variant?: 'strong' | 'em' | 'mark';
}

export const Emphasis = ({
  variant = 'em',
  children,
  className = '',
}: EmphasisProps) => {
  return (
    <Text as={variant} className={className}>
      {children}
    </Text>
  );
};

interface CaptionProps extends BaseProps {
  variant?: 'xs' | 'sm';
}

export const Caption = ({
  variant = 'sm',
  children,
  className = '',
}: CaptionProps) => {
  return (
    <Text
      as="span"
      variant={variant}
      className={combineClasses('text-gray-500', className)}
    >
      {children}
    </Text>
  );
}; 