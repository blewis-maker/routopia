'use client';

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { debounce } from 'lodash';
import { useSession } from 'next-auth/react';

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

interface RecentLocation {
  place_name: string;
  center: [number, number];
  timestamp: number;
}

const MAX_RECENT_LOCATIONS = 5;

// Add user-specific prefix to localStorage keys
const getUserStorageKey = (userId: string, type: 'start' | 'dest') => {
  return `user_${userId}_recent_${type}_locations`;
};

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
  const [recentStartLocations, setRecentStartLocations] = useState<RecentLocation[]>([]);
  const [recentDestinations, setRecentDestinations] = useState<RecentLocation[]>([]);
  const { data: session } = useSession();

  // Load recent locations from database
  useEffect(() => {
    const loadRecentLocations = async () => {
      if (!session?.user?.id) {
        console.log('No user session, skipping recent locations load');
        return;
      }

      try {
        console.log('Fetching recent locations for user:', session.user.id);
        
        const response = await fetch(`/api/users/${session.user.id}/recent-locations`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'include' // Important for auth cookies
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to load recent locations:', response.status, errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Invalid content type:', contentType);
          throw new Error('Invalid response type from server');
        }

        const data = await response.json();
        console.log('Received recent locations:', data);

        if (data.startLocations) {
          setRecentStartLocations(data.startLocations.map((loc: any) => ({
            place_name: loc.place_name,
            center: [loc.center_lng, loc.center_lat] as [number, number],
            timestamp: new Date(loc.timestamp).getTime()
          })));
        }

        if (data.destLocations) {
          setRecentDestinations(data.destLocations.map((loc: any) => ({
            place_name: loc.place_name,
            center: [loc.center_lng, loc.center_lat] as [number, number],
            timestamp: new Date(loc.timestamp).getTime()
          })));
        }
      } catch (error) {
        console.error('Failed to load recent locations:', error);
        // Set empty arrays to prevent undefined errors
        setRecentStartLocations([]);
        setRecentDestinations([]);
      }
    };

    loadRecentLocations();
  }, [session?.user?.id]);

  // Modified addToRecent function
  const addToRecent = async (
    location: { place_name: string; center: [number, number] },
    isStart: boolean
  ) => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch('/api/recent-locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          place_name: location.place_name,
          center_lat: location.center[1],
          center_lng: location.center[0],
          locationType: isStart ? 'start' : 'destination'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save location');
      }

      // Update local state
      const newLocation: RecentLocation = {
        ...location,
        timestamp: Date.now()
      };

      if (isStart) {
        setRecentStartLocations(prev => {
          const filtered = prev.filter(loc => loc.place_name !== location.place_name);
          return [newLocation, ...filtered].slice(0, MAX_RECENT_LOCATIONS);
        });
      } else {
        setRecentDestinations(prev => {
          const filtered = prev.filter(loc => loc.place_name !== location.place_name);
          return [newLocation, ...filtered].slice(0, MAX_RECENT_LOCATIONS);
        });
      }
    } catch (error) {
      console.error('Failed to save recent location:', error);
    }
  };

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
    markerEl.className = 'mapboxgl-marker-container';
    markerEl.innerHTML = `
      <div class="mapboxgl-marker">
        <div class="mapboxgl-marker-inner">
          <img src="/logo.svg" alt="Location" width="24" height="24" />
        </div>
        <div class="mapboxgl-marker-pulse"></div>
      </div>
    `;

    locationMarker.current = new mapboxgl.Marker({
      element: markerEl,
      anchor: 'bottom'
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
        .mapboxgl-marker-container {
          width: 32px;
          height: 32px;
          cursor: pointer;
          transform-origin: center bottom;
        }
        
        .mapboxgl-marker {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          perspective: 1000px;
        }
        
        .mapboxgl-marker-inner {
          position: absolute;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: floatMarker 3s ease-in-out infinite;
          will-change: transform;
          filter: drop-shadow(0 0 8px rgba(66, 135, 245, 0.6));
        }
        
        .mapboxgl-marker-inner img {
          transform-style: preserve-3d;
          backface-visibility: hidden;
          filter: brightness(1.2);
        }
        
        .mapboxgl-marker-pulse {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: radial-gradient(
            circle at center,
            rgba(66, 135, 245, 0.2) 0%,
            rgba(66, 135, 245, 0.1) 45%,
            rgba(66, 135, 245, 0) 70%
          );
          box-shadow: 
            0 0 15px rgba(66, 135, 245, 0.4),
            0 0 30px rgba(66, 135, 245, 0.2),
            0 0 45px rgba(66, 135, 245, 0.1);
          animation: pulseGlow 2s ease-in-out infinite;
          will-change: transform, opacity;
        }
        
        .mapboxgl-marker::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 50%;
          transform: translateX(-50%);
          width: 16px;
          height: 2px;
          background: rgba(66, 135, 245, 0.4);
          border-radius: 50%;
          filter: blur(2px);
          animation: shadowPulse 3s ease-in-out infinite;
        }

        @keyframes floatMarker {
          0%, 100% { 
            transform: translateY(0) rotateX(0);
            filter: drop-shadow(0 4px 8px rgba(66, 135, 245, 0.2));
          }
          50% { 
            transform: translateY(-8px) rotateX(5deg);
            filter: drop-shadow(0 8px 12px rgba(66, 135, 245, 0.3));
          }
        }
        
        @keyframes pulseGlow {
          0%, 100% {
            transform: scale(0.95);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.8);
            opacity: 0;
          }
        }

        @keyframes shadowPulse {
          0%, 100% {
            opacity: 0.4;
            transform: translateX(-50%) scale(1);
          }
          50% {
            opacity: 0.2;
            transform: translateX(-50%) scale(1.5);
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
          
          /* Hide scrollbar for Chrome, Safari and Opera */
          &::-webkit-scrollbar {
            display: none;
          }
          
          /* Hide scrollbar for IE, Edge and Firefox */
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
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
        .recent-location-item {
          display: flex;
          align-items: center;
          padding: 10px 12px;
          cursor: pointer;
          transition: background-color 0.2s;
          border-bottom: 1px solid #404040;
        }

        .recent-location-icon {
          margin-right: 8px;
          opacity: 0.6;
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
              onFocus={() => {
                if (!currentAddress) {
                  setStartSuggestions([]);
                  setShowStartSuggestions(true);
                }
              }}
              onBlur={() => {
                setTimeout(() => setShowStartSuggestions(false), 200);
              }}
            />
            {showStartSuggestions && (
              <div className="absolute w-full mt-1 suggestions-container">
                {currentAddress === '' && recentStartLocations.length > 0 && (
                  <div className="border-b border-gray-700 pb-2">
                    <div className="px-3 py-2 text-gray-400 text-xs">Recent Locations</div>
                    {recentStartLocations.map((location, index) => (
                      <div
                        key={`recent-${index}`}
                        className="recent-location-item text-white"
                        onClick={() => {
                          setCurrentAddress(location.place_name);
                          setShowStartSuggestions(false);
                          if (mapInstance.current) {
                            mapInstance.current.flyTo({
                              center: location.center,
                              zoom: 14
                            });
                          }
                          onStartLocationChange?.(location.place_name);
                        }}
                      >
                        <span className="recent-location-icon">⭐</span>
                        {location.place_name}
                      </div>
                    ))}
                  </div>
                )}
                {startSuggestions.map((suggestion, index) => (
                  <div
                    key={`suggestion-${index}`}
                    className="suggestion-item text-white"
                    onClick={() => {
                      setCurrentAddress(suggestion.place_name);
                      setShowStartSuggestions(false);
                      addToRecent(suggestion, true);
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
              onFocus={() => {
                if (!destinationAddress) {
                  setDestSuggestions([]);
                  setShowDestSuggestions(true);
                }
              }}
              onBlur={() => {
                setTimeout(() => setShowDestSuggestions(false), 200);
              }}
            />
            {showDestSuggestions && (
              <div className="absolute w-full mt-1 suggestions-container">
                {destinationAddress === '' && recentDestinations.length > 0 && (
                  <div className="border-b border-gray-700 pb-2">
                    <div className="px-3 py-2 text-gray-400 text-xs">Recent Destinations</div>
                    {recentDestinations.map((location, index) => (
                      <div
                        key={`recent-${index}`}
                        className="recent-location-item text-white"
                        onClick={() => {
                          setDestinationAddress(location.place_name);
                          setShowDestSuggestions(false);
                          if (mapInstance.current) {
                            mapInstance.current.flyTo({
                              center: location.center,
                              zoom: 14
                            });
                          }
                          onDestinationChange?.(location.place_name);
                        }}
                      >
                        <span className="recent-location-icon">📍</span>
                        {location.place_name}
                      </div>
                    ))}
                  </div>
                )}
                {destSuggestions.map((suggestion, index) => (
                  <div
                    key={`suggestion-${index}`}
                    className="suggestion-item text-white"
                    onClick={() => {
                      setDestinationAddress(suggestion.place_name);
                      setShowDestSuggestions(false);
                      addToRecent(suggestion, false);
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
