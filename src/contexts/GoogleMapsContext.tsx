'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { env } from '@/env.mjs';

interface GoogleMapsContextType {
  isLoaded: boolean;
  error: Error | null;
}

const GoogleMapsContext = createContext<GoogleMapsContextType>({
  isLoaded: false,
  error: null,
});

export function GoogleMapsProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loader = new Loader({
      apiKey: env.NEXT_PUBLIC_GOOGLE_MAPS_KEY,
      version: 'weekly',
      libraries: ['places', 'geometry', 'drawing'],
    });

    loader.load()
      .then(() => {
        console.log('Google Maps loaded successfully');
        setIsLoaded(true);
      })
      .catch((err) => {
        console.error('Google Maps load error:', err);
        setError(err);
      });
  }, []);

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, error }}>
      {children}
    </GoogleMapsContext.Provider>
  );
}

export function useGoogleMaps() {
  const context = useContext(GoogleMapsContext);
  if (!context) {
    throw new Error('useGoogleMaps must be used within a GoogleMapsProvider');
  }
  return context;
} 