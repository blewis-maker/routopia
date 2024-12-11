'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import GoogleMapsLoader from '@/services/maps/GoogleMapsLoader';

interface GoogleMapsContextType {
  isLoaded: boolean;
  error: Error | null;
}

const GoogleMapsContext = createContext<GoogleMapsContextType>({
  isLoaded: false,
  error: null
});

const GOOGLE_MAPS_LIBRARIES = [
  'places',
  'geometry',
  'drawing',
  'visualization'
] as const;

export function GoogleMapsProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initGoogleMaps = async () => {
      try {
        const loader = GoogleMapsLoader.getInstance();
        await loader.load({
          libraries: GOOGLE_MAPS_LIBRARIES
        });
        setIsLoaded(true);
      } catch (err) {
        console.error('Failed to load Google Maps:', err);
        setError(err instanceof Error ? err : new Error('Failed to load Google Maps'));
      }
    };

    initGoogleMaps();
  }, []);

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, error }}>
      {children}
    </GoogleMapsContext.Provider>
  );
}

export function useGoogleMaps() {
  return useContext(GoogleMapsContext);
} 