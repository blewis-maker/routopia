'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { styleGuide as sg } from '@/styles/theme/styleGuide';

interface SearchBoxProps {
  onPlaceSelected?: (place: google.maps.places.PlaceResult) => void;
  placeholder?: string;
  className?: string;
}

const autocompleteStyles = {
  container: {
    width: '100%',
  },
  suggestions: {
    backgroundColor: '#1c1c1c',
    border: '1px solid #404040',
    borderRadius: '0.5rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    marginTop: '0.5rem',
    zIndex: 1000,
  },
  suggestion: {
    backgroundColor: '#1c1c1c',
    padding: '0.75rem 1rem',
    cursor: 'pointer',
    transition: 'all 150ms ease',
    color: '#e5e5e5',
  },
  suggestionHighlighted: {
    backgroundColor: '#2d2d2d',
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    backgroundColor: '#1c1c1c',
    color: '#e5e5e5',
    border: '1px solid #404040',
    borderRadius: '0.5rem',
    outline: 'none',
  }
};

export function SearchBox({ onPlaceSelected, placeholder = "Choose destination...", className }: SearchBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!inputRef.current) return;

    // Initialize Google Places Autocomplete
    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      fields: ['formatted_address', 'geometry', 'name'],
      types: ['geocode', 'establishment']
    });

    // Apply custom styles to the autocomplete dropdown
    const pacContainer = document.querySelector('.pac-container') as HTMLElement;
    if (pacContainer) {
      pacContainer.style.backgroundColor = autocompleteStyles.suggestions.backgroundColor;
      pacContainer.style.border = autocompleteStyles.suggestions.border;
      pacContainer.style.borderRadius = autocompleteStyles.suggestions.borderRadius;
      pacContainer.style.boxShadow = autocompleteStyles.suggestions.boxShadow;
      pacContainer.style.marginTop = autocompleteStyles.suggestions.marginTop;
      pacContainer.style.zIndex = String(autocompleteStyles.suggestions.zIndex);
    }

    // Add place_changed event listener
    const listener = autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace();
      if (place && onPlaceSelected) {
        onPlaceSelected(place);
      }
    });

    return () => {
      // Cleanup
      google.maps.event.removeListener(listener);
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onPlaceSelected]);

  return (
    <div className={cn("relative w-full", className)}>
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        className={cn(
          "w-full px-4 py-2 rounded-lg",
          "bg-stone-900/90 backdrop-blur-sm",
          "border border-stone-800",
          "text-stone-200 placeholder-stone-500",
          "focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/50",
          "transition-all duration-200"
        )}
      />
    </div>
  );
}

// Add custom styles for Google Places Autocomplete dropdown
const style = document.createElement('style');
style.textContent = `
  .pac-container {
    background-color: #1c1c1c !important;
    border: 1px solid #404040 !important;
    border-radius: 0.5rem !important;
    font-family: inherit !important;
    margin-top: 0.25rem !important;
  }
  .pac-item {
    padding: 0.75rem 1rem !important;
    color: #e5e5e5 !important;
    border-color: #404040 !important;
    font-family: inherit !important;
  }
  .pac-item:hover {
    background-color: #2d2d2d !important;
  }
  .pac-item-query {
    color: #e5e5e5 !important;
    font-family: inherit !important;
  }
  .pac-matched {
    color: #10b981 !important;
  }
  .pac-icon {
    filter: invert(1) !important;
  }
`;
document.head.appendChild(style); 