import { useState, useEffect } from 'react';
import { useGeolocation } from './useGeolocation';

interface POI {
  id: string;
  name: string;
  category: string;
  rating: number;
  distance: string;
  location: string;
  photoReference: string;
}

export function usePOIData(limit: number = 3) {
  const [pois, setPois] = useState<POI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { location } = useGeolocation();

  useEffect(() => {
    async function fetchPOIs() {
      if (!location) return;

      try {
        const response = await fetch(
          `/api/places/nearby?lat=${location.lat}&lng=${location.lng}&limit=${limit}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch POIs');
        }

        const data = await response.json();
        
        // Transform Google Places data to our POI format
        const transformedPOIs: POI[] = data.results.map((place: any) => ({
          id: place.place_id,
          name: place.name,
          category: place.types[0].replace(/_/g, ' '), // Transform first type to readable format
          rating: place.rating || 0,
          distance: place.distance ? `${(place.distance / 1000).toFixed(1)} km` : 'N/A',
          location: place.vicinity,
          photoReference: place.photos?.[0]?.photo_reference || '',
        }));

        setPois(transformedPOIs);
        setError(null);
      } catch (err) {
        console.error('Error fetching POIs:', err);
        setError('Failed to load nearby places');
      } finally {
        setLoading(false);
      }
    }

    fetchPOIs();
  }, [location, limit]);

  return { pois, loading, error };
} 