'use client';

import { useEffect, useRef, useState } from 'react';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import { Locate, LocateFixed } from 'lucide-react';
import { baseStyles, roundedStyles, glassStyles, inputStyles } from '@/styles/components';
import { cn } from '@/lib/utils';

// Add custom styles for Google Places Autocomplete dropdown
const style = document.createElement('style');
style.textContent = `
  .pac-container {
    background-color: rgba(28, 28, 28, 0.95) !important;
    backdrop-filter: blur(8px) !important;
    border: 1px solid rgba(68, 68, 68, 0.5) !important;
    border-radius: 0.75rem !important;
    font-family: inherit !important;
    margin-top: 0.5rem !important;
    z-index: 1000 !important;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 
                0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
    padding: 0.5rem 0 !important;
  }
  
  .pac-item {
    padding: 0.75rem 1rem !important;
    color: #e5e5e5 !important;
    border: none !important;
    font-family: inherit !important;
    font-size: 0.875rem !important;
    line-height: 1.25rem !important;
    display: flex !important;
    align-items: center !important;
    gap: 0.75rem !important;
    transition: all 150ms ease-in-out !important;
  }
  
  .pac-item:hover {
    background-color: rgba(45, 45, 45, 0.8) !important;
    cursor: pointer !important;
  }
  
  .pac-item-query {
    color: #e5e5e5 !important;
    font-family: inherit !important;
    font-size: 0.875rem !important;
    padding-right: 0.5rem !important;
  }
  
  .pac-matched {
    color: #10b981 !important;
    font-weight: 500 !important;
  }
  
  .pac-icon {
    filter: invert(1) !important;
    margin-right: 0.5rem !important;
  }
  
  /* Style the Powered by Google element */
  .pac-container:after {
    background-color: rgba(28, 28, 28, 0.95) !important;
    padding: 0.5rem 1rem !important;
    height: auto !important;
    font-size: 0.75rem !important;
    color: #6b7280 !important;
    border-top: 1px solid rgba(68, 68, 68, 0.5) !important;
    margin-top: 0.5rem !important;
  }
  
  /* Additional refinements */
  .pac-item span:not(.pac-item-query) {
    color: #9ca3af !important;
    font-size: 0.75rem !important;
  }
  
  /* Improve focus states */
  .pac-item.pac-item-selected {
    background-color: rgba(45, 45, 45, 0.8) !important;
  }
`;
document.head.appendChild(style);

interface SearchResult {
  coordinates: [number, number];
  formatted_address: string;
  place_name?: string;
  place_id?: string;
}

interface SearchBoxProps {
  onSelect: (result: SearchResult) => void;
  placeholder?: string;
  initialValue?: string;
  useCurrentLocation?: boolean;
  className?: string;
  isLocationSet?: boolean;
}

export function SearchBox({ 
  onSelect, 
  placeholder = 'Search locations...', 
  useCurrentLocation = false,
  initialValue = '',
  className = '',
  isLocationSet = false
}: SearchBoxProps) {
  const [inputValue, setInputValue] = useState(initialValue);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isLoaded } = useGoogleMaps();

  // Update input value when initialValue changes
  useEffect(() => {
    setInputValue(initialValue);
  }, [initialValue]);

  // Initialize autocomplete when Google Maps is loaded
  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current) return;

    try {
      const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        fields: ['formatted_address', 'geometry', 'name', 'place_id'],
        types: ['geocode', 'establishment']
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry?.location) {
          onSelect({
            coordinates: [
              place.geometry.location.lng(),
              place.geometry.location.lat()
            ],
            formatted_address: place.formatted_address || '',
            place_name: place.name,
            place_id: place.place_id
          });
        }
      });

      autocompleteRef.current = autocomplete;
    } catch (error) {
      console.error('Failed to initialize autocomplete:', error);
    }

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
  }, [isLoaded, onSelect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <div className={cn(
      baseStyles.card,
      roundedStyles.lg,
      glassStyles.dark,
      'w-full relative',
      className
    )}>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={cn(
          baseStyles.input,
          'w-full bg-transparent px-4 py-2.5',
          'text-stone-200 placeholder-stone-500',
          'text-sm font-medium',
          inputStyles.dark
        )}
      />

      {useCurrentLocation && (
        <button
          className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${
            isLocationSet ? 'text-emerald-500 hover:text-emerald-400' : 'text-stone-400 hover:text-stone-300'
          }`}
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  onSelect({
                    coordinates: [position.coords.longitude, position.coords.latitude],
                    formatted_address: 'Current Location'
                  });
                },
                (error) => {
                  console.error('Error getting location:', error);
                }
              );
            }
          }}
        >
          {isLocationSet ? (
            <LocateFixed className="w-4 h-4" />
          ) : (
            <Locate className="w-4 h-4" />
          )}
        </button>
      )}
    </div>
  );
} 