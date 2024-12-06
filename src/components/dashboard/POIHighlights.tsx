import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useGeolocation } from '@/hooks/useGeolocation';
import type { POI, POICategory } from '@/types/poi';

export function POIHighlights() {
  const { location, error, loading } = useGeolocation();
  const [pois, setPois] = useState<POI[]>([]);
  const [poisLoading, setPoisLoading] = useState(true);

  useEffect(() => {
    if (location) {
      const fetchPOIs = async () => {
        try {
          const response = await fetch(
            `/api/pois/nearby?lat=${location.lat}&lng=${location.lng}&limit=5`
          );
          const data = await response.json();
          setPois(data.results);
        } catch (error) {
          console.error('Failed to fetch POIs:', error);
        } finally {
          setPoisLoading(false);
        }
      };

      fetchPOIs();
    }
  }, [location]);

  if (loading || poisLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-stone-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-stone-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-stone-400 text-center py-4">
        Unable to fetch nearby points of interest
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Nearby Places</h2>
        <Link 
          href="/poi" 
          className="text-emerald-500 hover:text-emerald-400 text-sm"
        >
          View All
        </Link>
      </div>

      <div className="space-y-3">
        {pois.length === 0 ? (
          <div className="text-center py-8 text-stone-400">
            <p>No points of interest found nearby</p>
            <Link 
              href="/poi"
              className="text-emerald-500 hover:text-emerald-400 mt-2 inline-block"
            >
              Browse all locations
            </Link>
          </div>
        ) : (
          pois.map((poi) => (
            <Link
              key={poi.id}
              href={`/poi/${poi.id}`}
              className="block bg-stone-700 rounded-lg p-4 hover:bg-stone-600 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-white">{poi.name}</h3>
                  <p className="text-sm text-stone-400">{poi.category}</p>
                </div>
                {poi.rating && (
                  <div className="flex items-center text-sm">
                    <span className="text-yellow-400">★</span>
                    <span className="text-white ml-1">{poi.rating}</span>
                  </div>
                )}
              </div>

              {poi.details && (
                <div className="mt-2 text-sm">
                  {poi.details.openingHours && (
                    <div className="text-stone-400">
                      {poi.details.openingHours}
                    </div>
                  )}
                  {poi.details.pricing && (
                    <div className="text-stone-400">
                      Price Level: {poi.details.pricing.level}
                    </div>
                  )}
                </div>
              )}

              {poi.realtime && (
                <div className="mt-2 flex space-x-4 text-sm">
                  {poi.realtime.crowdLevel && (
                    <span className="text-stone-400">
                      Crowd: {poi.realtime.crowdLevel}
                    </span>
                  )}
                  {poi.realtime.waitTime !== undefined && (
                    <span className="text-stone-400">
                      Wait: {poi.realtime.waitTime}min
                    </span>
                  )}
                </div>
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  );
} 