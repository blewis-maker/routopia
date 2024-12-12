'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Location } from '@/types';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';

interface SearchBoxProps {
  placeholder?: string;
  onSelect: (location: Location) => void;
  className?: string;
  initialValue?: string;
}

export function SearchBox({
  placeholder = 'Search location...',
  onSelect,
  className,
  initialValue = ''
}: SearchBoxProps) {
  const [value, setValue] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const { isLoaded } = useGoogleMaps();

  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;

    // Initialize Google Places Autocomplete
    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      fields: ['formatted_address', 'geometry', 'name'],
      types: ['address', 'establishment']
    });

    // Add place_changed event listener
    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace();
      
      if (place?.geometry?.location) {
        const location: Location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          address: place.formatted_address || '',
          name: place.name || ''
        };
        
        setValue(place.formatted_address || place.name || '');
        onSelect(location);
      }
    });

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [isLoaded, onSelect]);

  const handleClear = () => {
    setValue('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={cn(
      "relative",
      className
    )}>
      <div className={cn(
        "relative flex items-center",
        "bg-stone-950/80",
        "backdrop-blur-md",
        "border border-stone-800/50",
        "rounded-lg",
        "transition-all duration-200",
        isFocused && "border-teal-500/50 shadow-lg shadow-teal-500/10"
      )}>
        <Search className={cn(
          "absolute left-3",
          "w-4 h-4",
          "text-stone-400",
          isFocused && "text-teal-500",
          "transition-colors"
        )} />
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={cn(
            "w-full",
            "bg-transparent",
            "px-9 py-2",
            "text-sm text-stone-200",
            "placeholder:text-stone-500",
            "focus:outline-none"
          )}
        />

        {value && (
          <button
            onClick={handleClear}
            className={cn(
              "absolute right-3",
              "p-0.5",
              "text-stone-400 hover:text-stone-300",
              "transition-colors"
            )}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
} 