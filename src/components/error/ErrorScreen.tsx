import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorScreenProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorScreen({ 
  message = 'Something went wrong', 
  onRetry 
}: ErrorScreenProps) {
  return (
    <div className="fixed inset-0 z-50 bg-[#1B1B1B]/95 backdrop-blur-sm flex flex-col items-center justify-center">
      <AlertTriangle 
        className={cn(
          "w-12 h-12",
          "text-red-500",
          "animate-pulse-neon",
          "filter drop-shadow-[0_0_4px_rgba(239,68,68,0.5)]",
          "mb-4"
        )}
      />
      <h2 className="text-xl font-medium text-stone-200 mb-2">
        {message}
      </h2>
      {onRetry && (
        <button
          onClick={onRetry}
          className={cn(
            "px-4 py-2 mt-4",
            "text-sm font-medium",
            "bg-stone-800/50",
            "border border-stone-700/50",
            "rounded-lg",
            "transition-all duration-200",
            "hover:bg-stone-700/50",
            "hover:border-stone-600/50",
            "active:translate-y-[1px]"
          )}
        >
          Try again
        </button>
      )}
    </div>
  );
} 