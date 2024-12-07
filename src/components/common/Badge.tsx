import React from 'react';
import { Text } from './Typography';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export const Badge = ({
  children,
  variant = 'default',
  className = '',
}: BadgeProps) => {
  const variantClasses: Record<BadgeVariant, string> = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };

  return (
    <span
      className={`
        inline-flex items-center
        px-2.5 py-0.5
        rounded-full
        ${variantClasses[variant]}
        ${className}
      `}
    >
      <Text variant="sm" className="font-medium">
        {children}
      </Text>
    </span>
  );
}; 