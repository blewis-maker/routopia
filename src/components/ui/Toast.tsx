import { useEffect } from 'react';
import { X } from 'lucide-react';
import { create } from 'zustand';
import { ToastVariant } from '@/hooks/useToast';

interface ToastProps {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  onClose: () => void;
}

export function Toast({ 
  title, 
  description, 
  variant = 'default',
  onClose 
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const variantStyles = {
    default: 'bg-stone-800 border-stone-700',
    success: 'bg-emerald-900/50 border-emerald-800/50',
    warning: 'bg-amber-900/50 border-amber-800/50',
    error: 'bg-red-900/50 border-red-800/50'
  };

  return (
    <div className={`${variantStyles[variant]} rounded-lg border p-4 shadow-lg backdrop-blur-sm`}>
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h3 className="font-medium text-stone-200">{title}</h3>
          {description && (
            <p className="mt-1 text-sm text-stone-400">{description}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-stone-400 hover:text-stone-300"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
} 