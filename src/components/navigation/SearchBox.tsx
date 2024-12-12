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
    background: rgba(28, 28, 28, 0.95) !important;
    backdrop-filter: blur(12px) !important;
    border: 1px solid rgba(68, 68, 68, 0.5) !important;
    border-radius: 8px !important;
    font-family: var(--font-sans) !important;
    margin-top: 8px !important;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 
                0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
    padding: 4px !important;
    z-index: 1000 !important;
    max-width: calc(100% - 24px) !important;
    text-rendering: optimizeLegibility !important;
    font-feature-settings: "cv02", "cv03", "cv04", "cv11" !important;
  }
  
  .pac-item {
    padding: 8px 12px !important;
    color: var(--color-stone-50) !important;
    border: none !important;
    font-family: inherit !important;
    font-size: 13px !important;
    line-height: 1.4 !important;
    display: flex !important;
    align-items: center !important;
    gap: 0 !important;
    margin: 2px !important;
    border-radius: 6px !important;
    transition: all 150ms ease-out !important;
    font-weight: 400 !important;
  }
  
  .pac-item:hover {
    background-color: rgba(45, 45, 45, 0.95) !important;
    cursor: pointer !important;
  }
  
  .pac-item-query {
    color: var(--color-stone-50) !important;
    font-family: inherit !important;
    font-size: 13px !important;
    padding-right: 6px !important;
    font-weight: 500 !important;
  }
  
  .pac-matched {
    color: var(--color-primary) !important;
    font-weight: 600 !important;
  }
  
  /* Hide the location marker icon */
  .pac-icon {
    display: none !important;
  }
  
  /* Hide the Powered by Google element */
  .pac-container:after {
    display: none !important;
  }
  
  /* Additional refinements */
  .pac-item span:not(.pac-item-query) {
    color: var(--color-stone-400) !important;
    font-size: 12px !important;
    opacity: 0.8 !important;
  }
  
  /* Improve focus states */
  .pac-item.pac-item-selected,
  .pac-item:focus {
    background-color: rgba(43, 175, 157, 0.15) !important;
    outline: none !important;
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
        fields: ['formatted_address', 'geometry', 'name', 'place_id', 'address_components'],
        types: ['geocode', 'establishment'],
        componentRestrictions: { country: 'us' },
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry?.location) {
          // Get address components
          const addressComponents = place.address_components || [];
          
          // Build formatted address without country and state
          const streetNumber = addressComponents.find(c => c.types.includes('street_number'))?.long_name || '';
          const street = addressComponents.find(c => c.types.includes('route'))?.long_name || '';
          const city = addressComponents.find(c => c.types.includes('locality'))?.long_name || '';
          const state = addressComponents.find(c => c.types.includes('administrative_area_level_1'))?.short_name || '';
          
          // Construct address without USA
          const formattedAddress = `${streetNumber} ${street}, ${city}, ${state}`.trim();

          onSelect({
            coordinates: [
              place.geometry.location.lng(),
              place.geometry.location.lat()
            ],
            formatted_address: formattedAddress,
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