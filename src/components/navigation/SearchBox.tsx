'use client';

import { useEffect, useRef, useState } from 'react';
import GoogleMapsLoader from '@/services/maps/GoogleMapsLoader';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import { Locate, LocateFixed } from 'lucide-react';
import { baseStyles, roundedStyles, glassStyles, inputStyles } from '@/styles/components';
import { cn } from '@/lib/utils';

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