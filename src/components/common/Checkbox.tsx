import React from 'react';
import { Text } from './Typography';

interface CheckboxProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
}

export const Checkbox = ({
  label,
  checked,
  onChange,
  className = '',
  disabled = false,
}: CheckboxProps) => {
  return (
    <label className={`inline-flex items-center ${className}`}>
      <div className="relative flex items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="
            w-4 h-4
            border-2 border-gray-300 rounded
            text-brand-primary
            focus:ring-2 focus:ring-brand-primary/50
            disabled:opacity-50
            transition-colors
            cursor-pointer
          "
        />
        {checked && (
          <svg
            className="absolute w-4 h-4 pointer-events-none text-brand-primary"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13.5 4.5l-7 7L3 8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      {label && (
        <Text
          variant="sm"
          className={`ml-2 ${
            disabled ? 'text-gray-400' : 'text-gray-700'
          }`}
        >
          {label}
        </Text>
      )}
    </label>
  );
}; 