'use client';

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { debounce } from 'lodash';

const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
if (!token) {
  throw new Error('Mapbox token not found');
}
mapboxgl.accessToken = token;

interface Location {
  coordinates: [number, number];
  address: string;
}

interface MapProps {
  startLocation: [number, number] | null;
  endLocation: [number, number] | null;
  waypoints: [number, number][];
  onLocationSelect: (coords: [number, number]) => void;
  onStartLocationChange?: (location: string) => void;
  onDestinationChange?: (location: string) => void;
}

export interface MapRef {
  showResponse: (response: string) => void;
  getCurrentLocation: () => { lat: number; lng: number } | null;
}

interface Suggestion {
  place_name: string;
  center: [number, number];
}

const Map = forwardRef<MapRef, MapProps>(({ 
  startLocation, 
  endLocation, 
  waypoints, 
  onLocationSelect,
  onStartLocationChange,
  onDestinationChange
}: MapProps, ref) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const locationMarker = useRef<mapboxgl.Marker | null>(null);
  const geolocateControl = useRef<mapboxgl.GeolocateControl | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentAddress, setCurrentAddress] = useState<string>('');
  const currentLocation = useRef<{ lat: number; lng: number } | null>(null);
  const [startSuggestions, setStartSuggestions] = useState<Suggestion[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<Suggestion[]>([]);
  const [showStartSuggestions, setShowStartSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  const [destinationAddress, setDestinationAddress] = useState('');

  // Optimized reverse geocoding with caching
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?` + 
        new URLSearchParams({
          access_token: token,
          types: 'address',
          limit: '1',
          language: 'en'
        })
      );
      
      if (!response.ok) throw new Error('Geocoding failed');
      
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const address = data.features[0].place_name;
        setCurrentAddress(address);
        onStartLocationChange?.(address);
        return address;
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
    return null;
  };

  // Add geocoding suggestions function
  const getSuggestions = async (query: string, proximity?: [number, number]) => {
    if (!query.trim()) return [];
    
    try {
      const params = new URLSearchParams({
        access_token: token,
        types: 'address,poi,place',
        limit: '5',
        country: 'US',
        language: 'en',
        ...(proximity && { proximity: `${proximity[0]},${proximity[1]}` })
      });

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${params}`
      );
      
      if (!response.ok) throw new Error('Geocoding failed');
      
      const data = await response.json();
      return data.features.map((feature: any) => ({
        place_name: feature.place_name,
        center: feature.center
      }));
    } catch (error) {
      console.error('Geocoding error:', error);
      return [];
    }
  };

  // Debounced suggestion fetchers
  const debouncedStartSuggestions = debounce(async (query: string) => {
    const suggestions = await getSuggestions(
      query,
      currentLocation.current ? [currentLocation.current.lng, currentLocation.current.lat] : undefined
    );
    setStartSuggestions(suggestions);
  }, 300);

  const debouncedDestSuggestions = debounce(async (query: string) => {
    const suggestions = await getSuggestions(
      query,
      currentLocation.current ? [currentLocation.current.lng, currentLocation.current.lat] : undefined
    );
    setDestSuggestions(suggestions);
  }, 300);

  // Initialize map and controls
  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-105.5217, 39.0084],
      zoom: 7,
      pitch: 0,
      bearing: 0
    });

    // Create marker with custom element
    const markerEl = document.createElement('div');
    markerEl.className = 'marker-container';
    markerEl.innerHTML = `
      <div class="marker">
        <div class="marker-inner">
          <img src="/logo.svg" alt="Location" width="32" height="32" />
        </div>
        <div class="marker-pulse"></div>
      </div>
    `;

    locationMarker.current = new mapboxgl.Marker({
      element: markerEl,
      anchor: 'center'
    });

    // Initialize geolocate control with high accuracy
    geolocateControl.current = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 6000
      },
      trackUserLocation: true,
      showAccuracyCircle: false,
      showUserLocation: false
    });

    map.addControl(geolocateControl.current, 'top-right');

    // Add other controls
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.addControl(new mapboxgl.ScaleControl({ unit: 'imperial' }), 'bottom-right');

    // Handle location events
    geolocateControl.current.on('geolocate', async (position) => {
      const { longitude, latitude } = position.coords;
      currentLocation.current = { lat: latitude, lng: longitude };
      
      // Update marker position
      if (locationMarker.current) {
        locationMarker.current.setLngLat([longitude, latitude]);
        if (!locationMarker.current.getElement().parentNode) {
          locationMarker.current.addTo(map);
        }
      }

      // Get and set address
      await reverseGeocode(latitude, longitude);
    });

    // Handle map load
    map.on('load', () => {
      setIsLoading(false);
      // Trigger geolocation after map loads
      geolocateControl.current?.trigger();
    });

    // Error handling
    geolocateControl.current.on('error', (err) => {
      console.error('Geolocation error:', err);
      setCurrentAddress('Location unavailable');
    });

    mapInstance.current = map;

    // Cleanup
    return () => {
      if (locationMarker.current) locationMarker.current.remove();
      if (mapInstance.current) mapInstance.current.remove();
      mapInstance.current = null;
    };
  }, []);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    showResponse: (response: string) => {
      if (currentLocation.current && mapInstance.current) {
        locationMarker.current?.setLngLat([
          currentLocation.current.lng,
          currentLocation.current.lat
        ]);
      }
    },
    getCurrentLocation: () => currentLocation.current
  }));

  return (
    <>
      <style jsx global>{`
        .marker-container {
          width: 40px;
          height: 40px;
          cursor: pointer;
        }
        
        .marker {
          position: relative;
          width: 100%;
          height: 100%;
        }
        
        .marker-inner {
          position: absolute;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: bounce 1s infinite;
          will-change: transform;
        }
        
        .marker-pulse {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: rgba(66, 135, 245, 0.2);
          animation: pulse 1.5s infinite;
          will-change: transform, opacity;
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes pulse {
          0% {
            transform: scale(0.5);
            opacity: 1;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .suggestions-container {
          background: #2D2D2D;
          border: 1px solid #404040;
          border-top: none;
          border-radius: 0 0 8px 8px;
          max-height: 200px;
          overflow-y: auto;
          z-index: 1000;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        
        .suggestion-item {
          padding: 10px 12px;
          cursor: pointer;
          transition: background-color 0.2s;
          border-bottom: 1px solid #404040;
          white-space: normal;
          line-height: 1.4;
          font-size: 0.9rem;
        }
        
        .suggestion-item:last-child {
          border-bottom: none;
        }
        
        .suggestion-item:hover {
          background-color: #404040;
        }

        /* Custom scrollbar for suggestions */
        .suggestions-container::-webkit-scrollbar {
          width: 8px;
        }

        .suggestions-container::-webkit-scrollbar-track {
          background: #2D2D2D;
          border-radius: 0 8px 8px 0;
        }

        .suggestions-container::-webkit-scrollbar-thumb {
          background: #404040;
          border-radius: 4px;
        }

        .suggestions-container::-webkit-scrollbar-thumb:hover {
          background: #4A4A4A;
        }
      `}</style>
      <div className="relative w-full h-full">
        <div className="absolute top-4 left-4 z-20 space-y-2 w-72">
          {/* Start Location Input */}
          <div className="relative">
            <input
              type="text"
              value={currentAddress}
              placeholder="Current Location"
              className="w-full px-4 py-2 rounded-lg bg-[#2D2D2D] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => {
                setCurrentAddress(e.target.value);
                debouncedStartSuggestions(e.target.value);
                setShowStartSuggestions(true);
              }}
              onFocus={() => setShowStartSuggestions(true)}
              onBlur={() => {
                // Delay hiding suggestions to allow for clicks
                setTimeout(() => setShowStartSuggestions(false), 200);
              }}
            />
            {showStartSuggestions && startSuggestions.length > 0 && (
              <div className="absolute w-full mt-1 suggestions-container">
                {startSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="suggestion-item text-white"
                    onClick={() => {
                      setCurrentAddress(suggestion.place_name);
                      setShowStartSuggestions(false);
                      if (mapInstance.current) {
                        mapInstance.current.flyTo({
                          center: suggestion.center,
                          zoom: 14
                        });
                      }
                      onStartLocationChange?.(suggestion.place_name);
                    }}
                  >
                    {suggestion.place_name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Destination Input */}
          <div className="relative">
            <input
              type="text"
              value={destinationAddress}
              placeholder="Destination"
              className="w-full px-4 py-2 rounded-lg bg-[#2D2D2D] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => {
                setDestinationAddress(e.target.value);
                debouncedDestSuggestions(e.target.value);
                setShowDestSuggestions(true);
              }}
              onFocus={() => setShowDestSuggestions(true)}
              onBlur={() => {
                // Delay hiding suggestions to allow for clicks
                setTimeout(() => setShowDestSuggestions(false), 200);
              }}
            />
            {showDestSuggestions && destSuggestions.length > 0 && (
              <div className="absolute w-full mt-1 suggestions-container">
                {destSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="suggestion-item text-white"
                    onClick={() => {
                      setDestinationAddress(suggestion.place_name);
                      setShowDestSuggestions(false);
                      if (mapInstance.current) {
                        mapInstance.current.flyTo({
                          center: suggestion.center,
                          zoom: 14
                        });
                      }
                      onDestinationChange?.(suggestion.place_name);
                    }}
                  >
                    {suggestion.place_name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Map Container */}
        <div ref={mapContainer} className="absolute inset-0" />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="text-white">Loading map...</div>
          </div>
        )}
      </div>
    </>
  );
});

Map.displayName = 'Map';

export default Map;
