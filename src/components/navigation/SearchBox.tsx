'use client';

import { useEffect, useRef, useState } from 'react';
import GoogleMapsLoader from '@/services/maps/GoogleMapsLoader';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';

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
}

export function SearchBox({ 
  onSelect, 
  placeholder = 'Search locations...', 
  useCurrentLocation = false,
  initialValue = '',
  className = ''
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
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 bg-[#1B1B1B]/95 text-stone-200 rounded-lg border border-stone-800/50 focus:outline-none focus:border-emerald-500/30 focus:ring-1 focus:ring-emerald-500/30 focus:ring-offset-0 resize-none placeholder-stone-500 text-sm font-medium"
        />
      </div>

      {useCurrentLocation && (
        <button
          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-emerald-400 transition-colors"
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
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
            />
          </svg>
        </button>
      )}
    </div>
  );
} 