'use client';

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import mapboxgl, { LngLatBounds } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { debounce } from 'lodash';
import { useSession } from 'next-auth/react';
import { RouteProcessor, ProcessedRoute } from '@/services/routing/RouteProcessor';
import { MapIntegrationLayer } from '@/services/maps/MapIntegrationLayer';
import { MAP_FEATURE_FLAGS } from '@/lib/config';

const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
if (!token) {
  throw new Error('Mapbox token not found');
}
mapboxgl.accessToken = token;

interface MapProps {
  startLocation: [number, number] | null;
  endLocation: [number, number] | null;
  waypoints: [number, number][];
  onLocationSelect: (coords: [number, number]) => void;
  onStartLocationChange?: (location: string) => void;
  onDestinationChange?: (location: string) => void;
  destinationFromChat?: string;
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

const MAP_CONTAINER_ID = 'routopia-map-container';

const Map = forwardRef<MapRef, MapProps>(({ 
  startLocation, 
  endLocation, 
  waypoints, 
  onLocationSelect,
  onStartLocationChange,
  onDestinationChange,
  destinationFromChat
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
  const { data: session, status } = useSession();
  const [destinationMarker, setDestinationMarker] = useState<mapboxgl.Marker | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const routeLayerId = 'route-line';
  const routeSourceId = 'route';
  const mapIntegration = useRef<MapIntegrationLayer | null>(null);
  const routeProcessor = useRef<RouteProcessor | null>(null);

  // Initialize RouteProcessor with map
  useEffect(() => {
    if (!routeProcessor.current) {
      routeProcessor.current = new RouteProcessor('mapbox', token);
    }
  }, []);

  // Load recent locations from database
  useEffect(() => {
    const loadRecentLocations = async () => {
      try {
        if (status !== 'authenticated') {
          console.log('User not authenticated, skipping recent locations');
          return;
        }

        const response = await fetch('/api/locations/recent');
        
        if (!response.ok) {
          if (response.status === 401) {
            console.log('User needs to authenticate');
            return;
          }
          if (response.status === 404) {
            console.log('No recent locations found');
            return;
          }
          throw new Error(`Failed to load recent locations: ${response.status}`);
        }

        const data = await response.json();
        setRecentStartLocations(data.startLocations || []);
        setRecentDestinations(data.destinations || []);
      } catch (error) {
        console.error('Error loading recent locations:', error);
        // Set empty arrays to prevent further loading attempts
        setRecentStartLocations([]);
        setRecentDestinations([]);
      }
    };

    loadRecentLocations();
  }, [status]); // Only run when authentication status changes

  // Modified addToRecent function
  const addToRecent = async (location: Suggestion, isStart: boolean) => {
    try {
      if (!session?.user?.id) {
        console.log('User not authenticated, skipping recent location save');
        return;
      }

      const newLocation = {
        place_name: location.place_name,
        center_lat: location.center[1], // Mapbox returns [lng, lat]
        center_lng: location.center[0],
        locationType: isStart ? 'START' : 'DESTINATION',
        timestamp: new Date()
      };

      // Make API call to save location
      const response = await fetch('/api/locations/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newLocation),
      });

      if (!response.ok) {
        throw new Error('Failed to save recent location');
      }

      // Convert to RecentLocation format for state update
      const recentLocationFormat: RecentLocation = {
        place_name: newLocation.place_name,
        center: [newLocation.center_lng, newLocation.center_lat],
        timestamp: Date.now()
      };

      // Update local state
      if (isStart) {
        setRecentStartLocations(prev => {
          const filtered = prev.filter(loc => loc.place_name !== recentLocationFormat.place_name);
          return [recentLocationFormat, ...filtered].slice(0, MAX_RECENT_LOCATIONS);
        });
      } else {
        setRecentDestinations(prev => {
          const filtered = prev.filter(loc => loc.place_name !== recentLocationFormat.place_name);
          return [recentLocationFormat, ...filtered].slice(0, MAX_RECENT_LOCATIONS);
        });
      }

    } catch (error) {
      console.error('Error adding recent location:', error);
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
    if (mapContainer.current && !mapIntegration.current) {
      mapContainer.current.id = MAP_CONTAINER_ID;
      
      mapIntegration.current = new MapIntegrationLayer(MAP_CONTAINER_ID);
      routeProcessor.current = new RouteProcessor(
        mapIntegration.current.getActiveProviderName(),
        token
      );

      mapIntegration.current.initialize().then(() => {
        if (MAP_FEATURE_FLAGS.useTrafficData) {
          mapIntegration.current?.setTrafficLayer(true);
        }
        
        mapIntegration.current?.setGeolocateControl(true);
        
        setIsLoading(false);
      });
    }
  }, []);

  // Function to get and set user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          currentLocation.current = { lat: latitude, lng: longitude };
          
          if (mapInstance.current) {
            mapInstance.current.flyTo({
              center: [longitude, latitude],
              zoom: 12
            });
            
            // Update marker position
            if (locationMarker.current) {
              locationMarker.current.setLngLat([longitude, latitude]);
            }
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  // Update your drawRoute function to use RouteProcessor
  const drawRoute = async (start: [number, number], end: [number, number]) => {
    if (!mapIntegration.current || !routeProcessor.current) return;

    try {
      // Process route using RouteProcessor
      const processedRoute = await routeProcessor.current.processRoute(
        { coordinates: start, address: currentAddress },
        { coordinates: end, address: destinationAddress },
        waypoints.map(wp => ({ coordinates: wp, address: '' }))
      );

      // Use MapIntegrationLayer to draw the route
      await mapIntegration.current.drawRoute(
        processedRoute.coordinates[0],
        processedRoute.coordinates[processedRoute.coordinates.length - 1],
        processedRoute.coordinates.slice(1, -1)
      );

      setRouteCoordinates(processedRoute.coordinates);

    } catch (error) {
      console.error('Error drawing route:', error);
      // Fallback to your existing Mapbox implementation if RouteProcessor fails
      try {
        const query = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${token}`
        );
        const json = await query.json();
        
        if (json.routes && json.routes[0]) {
          const route = json.routes[0].geometry.coordinates;
          setRouteCoordinates(route);
          
          if (mapInstance.current) {
            // Clean up existing route
            if (mapInstance.current.getLayer(routeLayerId)) {
              mapInstance.current.removeLayer(routeLayerId);
            }
            if (mapInstance.current.getSource(routeSourceId)) {
              mapInstance.current.removeSource(routeSourceId);
            }

            // Add new route
            mapInstance.current.addSource(routeSourceId, {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates: route
                }
              }
            });

            mapInstance.current.addLayer({
              id: routeLayerId,
              type: 'line',
              source: routeSourceId,
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              },
              paint: {
                'line-color': '#3b82f6',
                'line-width': 4,
                'line-opacity': 0.75
              }
            });

            // Fit bounds
            const bounds = new LngLatBounds();
            route.forEach((coord: [number, number]) => {
              bounds.extend(coord);
            });

            mapInstance.current.fitBounds(bounds, {
              padding: 50,
              duration: 1000,
              maxZoom: 15
            });
          }
        }
      } catch (fallbackError) {
        console.error('Fallback route calculation failed:', fallbackError);
      }
    }
  };

  // Add effect to handle destination changes
  useEffect(() => {
    if (destinationFromChat && currentLocation.current) {
      // Geocode the destination
      const geocodeDestination = async () => {
        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${
              encodeURIComponent(destinationFromChat)
            }.json?access_token=${token}&country=us&types=place,poi`
          );

          if (!response.ok) {
            throw new Error('Geocoding failed');
          }

          const data = await response.json();
          
          if (data.features?.[0]) {
            const coords = data.features[0].center;
            // Update destination address if callback exists
            if (onDestinationChange) {
              onDestinationChange(data.features[0].place_name);
            }
            
            // Draw route from current location to destination
            drawRoute(
              [currentLocation.current.lng, currentLocation.current.lat],
              coords
            );
          }
        } catch (error) {
          console.error('Error geocoding destination:', error);
        }
      };

      geocodeDestination();
    }
  }, [destinationFromChat]);

  // Expose methods via ref for ChatGPT integration
  useImperativeHandle(ref, () => ({
    showResponse: (response: string) => {
      // This will be called when ChatGPT suggests a location
      // Parse the response to extract coordinates and place name
      // Then call setDestination with the extracted data
    },
    getCurrentLocation: () => currentLocation.current
  }));

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          currentLocation.current = { lat: latitude, lng: longitude };
          console.log('Current location set:', currentLocation.current); // Debug log
        },
        (error) => console.error('Geolocation error:', error)
      );
    }
  }, []);

  // Add effect to handle destination from chat
  useEffect(() => {
    if (destinationFromChat) {
      setDestinationAddress(destinationFromChat);
      // Trigger geocoding for the new destination
      debouncedDestSuggestions(destinationFromChat);
    }
  }, [destinationFromChat]);

  // Clean up route when component unmounts
  useEffect(() => {
    return () => {
      if (mapInstance.current) {
        if (mapInstance.current.getLayer(routeLayerId)) {
          mapInstance.current.removeLayer(routeLayerId);
        }
        if (mapInstance.current.getSource(routeSourceId)) {
          mapInstance.current.removeSource(routeSourceId);
        }
      }
    };
  }, []);

  // Update your route calculation logic
  const calculateRoute = async (start: Location, end: Location) => {
    if (!mapIntegration.current) return;

    try {
      const route = await mapIntegration.current.calculateRoute(start, end);
      
      // Update UI with route information
      if (route.totalDistance && route.totalDuration) {
        // Update your route summary UI
        const distance = mapUtils.formatDistance(route.totalDistance);
        const duration = mapUtils.formatDuration(route.totalDuration);
        // Update your UI components...
      }
    } catch (error) {
      console.error('Failed to calculate route:', error);
      // Handle error in UI
    }
  };

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
        <div 
          ref={mapContainer} 
          id={MAP_CONTAINER_ID}
          className="absolute inset-0" 
        />
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
