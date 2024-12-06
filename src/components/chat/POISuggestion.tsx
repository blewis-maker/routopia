import React from 'react';
import { POIRecommendation } from '@/types/poi';

export interface POISuggestionProps {
  suggestions: string[];
  onSelect?: (suggestion: string) => void;
}

export const POISuggestion: React.FC<POISuggestionProps> = ({
  suggestions,
  onSelect
}) => {
  if (!suggestions.length) return null;

  return (
    <div className="poi-suggestions mt-2">
      <h4 className="text-sm font-medium mb-1">Suggested Points of Interest:</h4>
      <ul className="space-y-1">
        {suggestions.map((suggestion, index) => (
          <li
            key={`${suggestion}-${index}`}
            className="text-sm cursor-pointer hover:bg-gray-100 p-1 rounded"
            onClick={() => onSelect?.(suggestion)}
          >
            {suggestion}
          </li>
        ))}
      </ul>
    </div>
  );
}; 