'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { loadGoogleMaps } from '@/lib/maps/GoogleMapsLoader';

interface GoogleMapsContextType {
  isLoaded: boolean;
  error: Error | null;
}

const GoogleMapsContext = createContext<GoogleMapsContextType | undefined>(undefined);

export function GoogleMapsProvider({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function initGoogleMaps() {
      try {
        await loadGoogleMaps();
        setIsLoaded(true);
      } catch (err) {
        console.error('Failed to load Google Maps:', err);
        setError(err instanceof Error ? err : new Error('Failed to load Google Maps'));
      }
    }

    initGoogleMaps();
  }, []);

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, error }}>
      {children}
    </GoogleMapsContext.Provider>
  );
}

export function useGoogleMaps() {
  const context = useContext(GoogleMapsContext);
  if (context === undefined) {
    throw new Error('useGoogleMaps must be used within a GoogleMapsProvider');
  }
  return context;
} 