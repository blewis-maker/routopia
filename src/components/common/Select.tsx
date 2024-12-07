import React from 'react';
import { Text } from './Typography';

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  error?: string;
}

export const Select = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  className = '',
  error,
}: SelectProps) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <Text variant="sm" className="font-medium text-gray-700">
          {label}
        </Text>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`
          w-full px-3 py-2 bg-white
          border rounded-lg shadow-sm
          text-base text-gray-900
          placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-brand-primary/50
          disabled:bg-gray-50 disabled:text-gray-500
          transition-colors
          ${error ? 'border-red-500' : 'border-gray-300'}
        `}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <Text variant="sm" className="text-red-500">
          {error}
        </Text>
      )}
    </div>
  );
}; 