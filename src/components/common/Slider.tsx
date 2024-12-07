import React from 'react';
import { Text } from './Typography';

interface SliderProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export const Slider = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  className = '',
}: SliderProps) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Text variant="sm" className="font-medium text-gray-700">
          {label}
        </Text>
      )}
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="
            w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-brand-primary/50
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-brand-primary
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-all
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-thumb]:w-4
            [&::-moz-range-thumb]:h-4
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-brand-primary
            [&::-moz-range-thumb]:border-0
            [&::-moz-range-thumb]:cursor-pointer
            [&::-moz-range-thumb]:transition-all
            [&::-moz-range-thumb]:hover:scale-110
          "
        />
        <div 
          className="absolute left-0 top-1 h-2 bg-brand-primary rounded-l-lg pointer-events-none"
          style={{ width: `${(value - min) / (max - min) * 100}%` }}
        />
      </div>
      <div className="flex justify-between text-sm text-gray-500">
        <span>{min}</span>
        <span>{value}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}; 