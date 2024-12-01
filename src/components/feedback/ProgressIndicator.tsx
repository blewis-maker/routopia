import React from 'react';

interface Props {
  progress: number;
  label?: string;
  type?: 'linear' | 'circular';
  size?: 'sm' | 'md' | 'lg';
}

export const ProgressIndicator: React.FC<Props> = ({ 
  progress, 
  label, 
  type = 'linear',
  size = 'md' 
}) => {
  const getSize = () => {
    switch (size) {
      case 'sm': return 'h-1';
      case 'lg': return 'h-3';
      default: return 'h-2';
    }
  };

  return type === 'linear' ? (
    <div className="w-full">
      {label && (
        <div className="flex justify-between mb-1">
          <span className="text-sm text-stone-400">{label}</span>
          <span className="text-sm text-stone-400">{progress}%</span>
        </div>
      )}
      <div className={`bg-stone-700 rounded-full overflow-hidden ${getSize()}`}>
        <div 
          className="bg-emerald-500 transition-all duration-300 ease-out rounded-full h-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  ) : (
    <div className="relative">
      <svg className="transform -rotate-90" viewBox="0 0 36 36">
        <circle
          cx="18"
          cy="18"
          r="16"
          fill="none"
          className="stroke-stone-700"
          strokeWidth="2"
        />
        <circle
          cx="18"
          cy="18"
          r="16"
          fill="none"
          className="stroke-emerald-500 transition-all duration-300 ease-out"
          strokeWidth="2"
          strokeDasharray={`${progress} 100`}
        />
      </svg>
      {label && (
        <span className="absolute inset-0 flex items-center justify-center text-sm text-stone-400">
          {progress}%
        </span>
      )}
    </div>
  );
}; 