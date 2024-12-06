import { useState, useEffect } from 'react';
import { GeoPoint } from '@/types/mcp';

export function useMapIntegration() {
  const [currentLocation, setCurrentLocation] = useState<GeoPoint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentLocation = () => {
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by your browser');
        setIsLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsLoading(false);
        },
        (error) => {
          setError(error.message);
          setIsLoading(false);
        }
      );
    };

    getCurrentLocation();
  }, []);

  return { currentLocation, isLoading, error };
} 