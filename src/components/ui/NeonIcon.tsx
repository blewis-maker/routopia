import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NeonIconProps {
  icon: LucideIcon;
  color: 'green' | 'teal'; // extend as needed
  isActive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function NeonIcon({ 
  icon: Icon, 
  color, 
  isActive = false, 
  size = 'md',
  className 
}: NeonIconProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <Icon 
      className={cn(
        sizes[size],
        "transition-all duration-200",
        isActive ? [
          `text-neon-${color}-on`,
          'animate-pulse-neon',
          `filter drop-shadow-[0_0_2px_var(--neon-${color}-glow)]`
        ] : [
          `text-neon-${color}-off`,
          `hover:text-neon-${color}-on`,
          `hover:drop-shadow-[0_0_2px_var(--neon-${color}-glow)]`
        ],
        className
      )}
    />
  );
} 