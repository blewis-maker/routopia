'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Location } from '@/types';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';

interface SearchBoxProps {
  placeholder?: string;
  onSelect: (location: Location) => void;
  className?: string;
  initialValue?: string;
  onError?: (error: Error) => void;
  isLoading?: boolean;
}

export function SearchBox({
  placeholder = 'Search location...',
  onSelect,
  className,
  initialValue = '',
  onError,
  isLoading
}: SearchBoxProps) {
  const [value, setValue] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const { isLoaded } = useGoogleMaps();

  useEffect(() => {
    // Inject custom styles for the dropdown
    const style = document.createElement('style');
    style.textContent = `
      .pac-container {
        background: rgba(28, 25, 23, 0.95);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(68, 64, 60, 0.5);
        border-radius: 8px;
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
        margin-top: 4px;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
      }
      .pac-item {
        padding: 8px 12px;
        border-top: 1px solid rgba(68, 64, 60, 0.3);
        color: rgb(214, 211, 209);
        font-size: 14px;
        line-height: 20px;
        cursor: pointer;
      }
      .pac-item:hover {
        background: rgba(68, 64, 60, 0.3);
      }
      .pac-item-query {
        color: rgb(231, 229, 228);
        font-size: 14px;
      }
      .pac-matched {
        color: rgb(45, 212, 191);
      }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;

    try {
      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
        fields: ['formatted_address', 'geometry', 'name'],
        types: ['address', 'establishment']
      });

      autocompleteRef.current.addListener('place_changed', () => {
        try {
          const place = autocompleteRef.current?.getPlace();
          
          if (!place?.geometry?.location) {
            throw new Error('Invalid place selected');
          }

          const location: Location = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            address: place.formatted_address || '',
            name: place.name || ''
          };
          
          setValue(place.formatted_address || place.name || '');
          onSelect(location);
        } catch (error) {
          onError?.(error instanceof Error ? error : new Error('Failed to process location'));
        }
      });
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Failed to initialize search'));
    }

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [isLoaded, onSelect, onError]);

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
        isFocused && "border-teal-500/50 shadow-lg shadow-teal-500/10",
        isLoading && "opacity-75"
      )}>
        {isLoading ? (
          <Loader2 className="absolute left-3 w-4 h-4 text-teal-500 animate-spin" />
        ) : (
          <Search className={cn(
            "absolute left-3",
            "w-4 h-4",
            "text-stone-400",
            isFocused && "text-teal-500",
            "transition-colors"
          )} />
        )}
        
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
            "text-sm",
            "text-stone-200",
            "placeholder:text-stone-500",
            "focus:outline-none"
          )}
          disabled={isLoading}
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