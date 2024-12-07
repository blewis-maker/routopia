import React from 'react';

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
}

export const Heading: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <h2 className={`text-2xl font-bold ${className}`}>{children}</h2>
);

export const Text: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <p className={`text-base ${className}`}>{children}</p>
);

export const Caption: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <p className={`text-sm text-gray-600 ${className}`}>{children}</p>
);

export const Link: React.FC<TypographyProps & { href: string }> = ({
  children,
  href,
  className = '',
}) => (
  <a href={href} className={`text-blue-600 hover:text-blue-800 ${className}`}>
    {children}
  </a>
);

export const Emphasis: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <em className={`font-medium ${className}`}>{children}</em>
);

export const Typography = {
  Heading,
  Text,
  Caption,
  Link,
  Emphasis,
}; 