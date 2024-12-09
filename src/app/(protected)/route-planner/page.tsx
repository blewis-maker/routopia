'use client';

import { useState, useRef, useEffect } from 'react';
import { Location } from '@/types';
import { MapView } from '@/components/shared/MapView';
import { WeatherWidget } from '@/components/route-planner/WeatherWidget';
import { SearchBox } from '@/components/navigation/SearchBox';
import ChatWindow from '@/components/chat/ChatWindow';
import Image from 'next/image';
import { Coordinates } from '@/services/maps/MapServiceInterface';
import { useTheme } from 'next-themes';
import GoogleMapsLoader from '@/services/maps/GoogleMapsLoader';
import { GoogleMapsManager } from '@/services/maps/GoogleMapsManager';
import { MapToolbar } from '@/components/map/MapToolbar';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { Clock, Map } from 'lucide-react';
import { Route } from '@/types/route/types';
import { AIChat } from '@/components/chat/AIChat';
import { ChatMessage } from '@/types/chat/types';
import { ChatSuggestion } from '@/types/chat/types';
import { GoogleActivityType, UIActivityType } from '@/services/maps/MapServiceInterface';

interface WeatherInfo {
  location: string;
  coordinates: [number, number];
}

interface WeatherData {
  temperature: number;
  conditions: string;
  windSpeed: number;
  humidity: number;
  icon: string;
  location?: string;
}

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} min`;
};

const formatDistance = (meters: number): string => {
  // Check if user is in the US (you might want to make this configurable)
  const useImperial = true; // For US users
  
  if (useImperial) {
    const miles = meters / 1609.34; // Convert meters to miles
    return `${miles.toFixed(1)} mi`;
  } else {
    const km = meters / 1000;
    return `${km.toFixed(1)} km`;
  }
};

const mapActivityTypeToGoogle = (type: UIActivityType): GoogleActivityType => {
  switch (type) {
    case 'drive':
      return 'car';
    case 'bike':
      return 'bike';
    case 'run':
      return 'walk';
    // For now, map unsupported types to car
    case 'ski':
    case 'adventure':
    default:
      return 'car';
  }
};

export default function RoutePlannerPage() {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [destinationLocation, setDestinationLocation] = useState<Location | null>(null);
  const [weatherInfo, setWeatherInfo] = useState<WeatherInfo | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-105.0749801, 40.5852602]);
  const [mapZoom, setMapZoom] = useState(12);
  const geocoder = useRef<google.maps.Geocoder | null>(null);
  const mapServiceRef = useRef<GoogleMapsManager | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [activeLayer, setActiveLayer] = useState<'ROUTE' | 'SEARCH' | 'TRAFFIC' | 'LAYERS' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useTheme();
  const [mainRoute, setMainRoute] = useState<Route | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [routeType, setRouteType] = useState<'drive' | 'bike' | 'run' | 'ski' | 'adventure'>('drive');

  const handleChatMessage = async (message: string) => {
    const abortController = new AbortController();
    
    try {
      setIsGenerating(true);
      setMessages(prev => [...prev, { type: 'user', content: message }]);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          context: {
            start: userLocation?.address || null,
            message,
            mode: routeType,
            weather: weatherData ? {
              temperature: weatherData.temperature || 0,
              conditions: weatherData.conditions || 'unknown',
              windSpeed: weatherData.windSpeed || 0
            } : null
          }
        }),
        signal: abortController.signal
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to process request');

      setMessages(prev => [...prev, { 
        type: 'assistant', 
        content: data.message
      }]);

      // If we have a suggestion, update the destination and generate route
      if (data.suggestion) {
        try {
          // First update the destination location state
          setDestinationLocation({
            coordinates: [data.suggestion.location.lng, data.suggestion.location.lat],
            address: data.suggestion.name
          });

          // Then generate the route
          if (userLocation) {
            await generateRoute(
              userLocation.coordinates,
              [data.suggestion.location.lng, data.suggestion.location.lat]
            );
          }

        } catch (error) {
          console.error('Failed to handle suggestion:', error);
          setMessages(prev => [...prev, {
            type: 'assistant',
            content: 'I found a location but had trouble setting up the route. Please try again.'
          }]);
        }
      }

    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: error instanceof Error ? 
          `I apologize, but I encountered an error: ${error.message}` : 
          'I apologize, but I encountered an unexpected error.'
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMapServiceInit = (service: GoogleMapsManager) => {
    console.log('Map service initialized');
    mapServiceRef.current = service;
    
    // If we have a user location, update the marker
    if (userLocation) {
      const [lng, lat] = userLocation.coordinates;
      service.addUserLocationMarker({ lat, lng });
    }
  };

  // Generate route function
  const generateRoute = async (start: [number, number], end: [number, number]) => {
    if (!mapServiceRef.current) {
      console.error('Map service not initialized');
      return;
    }

    setIsLoading(true);
    try {
      // Clear existing routes and markers
      mapServiceRef.current.clearRoute();

      const startCoords = { lat: start[1], lng: start[0] };
      const endCoords = { lat: end[1], lng: end[0] };
      
      const googleActivityType = mapActivityTypeToGoogle(routeType);
      
      const routeVisualization = await mapServiceRef.current.generateRoute(
        startCoords,
        endCoords,
        {
          activityType: googleActivityType,
          alternatives: true
        }
      );

      if (!routeVisualization || !routeVisualization.mainRoute) {
        throw new Error('Failed to generate route visualization');
      }

      await mapServiceRef.current.drawRoute(routeVisualization, {
        activityType: googleActivityType,
        alternatives: true
      });

      // Update mainRoute state
      const route: Route = {
        id: 'generated-route',
        name: `Route to ${destinationLocation?.address || 'destination'}`,
        segments: [{
          startPoint: {
            latitude: start[1],
            longitude: start[0]
          },
          endPoint: {
            latitude: end[1],
            longitude: end[0]
          },
          distance: routeVisualization.mainRoute.distance || 0,
          duration: routeVisualization.mainRoute.duration || 0
        }],
        totalMetrics: {
          distance: routeVisualization.mainRoute.distance || 0,
          duration: routeVisualization.mainRoute.duration || 0
        },
        alternatives: routeVisualization.alternatives || []
      };
      setMainRoute(route);

    } catch (error) {
      console.error('Failed to generate route:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleMapClick = async (coordinates: Coordinates) => {
    if (!userLocation) {
      setUserLocation({
        coordinates: [coordinates.lng, coordinates.lat],
        address: 'Selected Location'
      });
    } else {
      const end: [number, number] = [coordinates.lng, coordinates.lat];
      await generateRoute(userLocation.coordinates, end);
    }
  };

  const handleDestinationSelect = async (result: any) => {
    if (!('coordinates' in result)) return;
    
    const [lng, lat] = result.coordinates;
    const address = result.formatted_address || result.place_name;
    
    // Clear existing routes and markers
    if (mapServiceRef.current) {
      mapServiceRef.current.clearRoute();
      mapServiceRef.current.clearDirectionsRenderer();
    }
    
    // Reset main route state
    setMainRoute(null);

    // Update destination location
    setDestinationLocation({
      coordinates: [lng, lat],
      address: address
    });

    // Generate new route if we have a start location
    if (userLocation) {
      try {
        await generateRoute(userLocation.coordinates, [lng, lat]);
      } catch (error) {
        console.error('Failed to generate route:', error);
      }
    }
  };

  const handleToolSelect = async (tool: 'ROUTE' | 'SEARCH' | 'TRAFFIC' | 'LAYERS') => {
    setActiveLayer(tool);
    
    if (tool === 'TRAFFIC' && mapServiceRef.current) {
      await mapServiceRef.current.setTrafficLayer(true);
    }
  };

  const handleLocationSelect = async (result: any) => {
    if (!('coordinates' in result)) return;
    
    const [lng, lat] = result.coordinates;
    const displayAddress = result.formatted_address || result.place_name;
    
    // Update map center first
    setMapCenter([lng, lat]);
    setMapZoom(14);
    
    // Update marker if map service is available
    if (mapServiceRef.current) {
      try {
        await mapServiceRef.current.addUserLocationMarker({ lat, lng });
      } catch (error) {
        console.error('Error updating marker:', error);
      }
    }
    
    // Update state with address
    setUserLocation({
      coordinates: [lng, lat],
      address: displayAddress
    });
    
    // Update weather info
    setWeatherInfo({
      location: displayAddress,
      coordinates: [lng, lat]
    });
    
    // Fetch weather data
    fetchWeatherData(lat, lng, displayAddress);
  };

  const fetchWeatherData = async (lat: number, lng: number, location?: string) => {
    try {
      const response = await fetch(`/api/weather?lat=${lat}&lng=${lng}`);
      if (!response.ok) throw new Error('Failed to fetch weather');
      const data = await response.json();
      setWeatherData({
        ...data,
        location: location
      });
    } catch (error) {
      console.error('Error fetching weather:', error);
    }
  };

  // Initialize geocoder
  useEffect(() => {
    const initGoogleServices = async () => {
      try {
        await GoogleMapsLoader.getInstance().load();
        if (!geocoder.current) {
          geocoder.current = new google.maps.Geocoder();
        }
      } catch (error) {
        console.error('Failed to initialize Google services:', error);
      }
    };

    initGoogleServices();
  }, []);

  // Get user's location on page load
  useEffect(() => {
    const getUserLocation = async () => {
      if (!geocoder.current) {
        await GoogleMapsLoader.getInstance().load();
        geocoder.current = new google.maps.Geocoder();
      }

      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        const { latitude: lat, longitude: lng } = position.coords;

        // Reverse geocode to get address
        const result = await geocoder.current.geocode({
          location: { lat, lng }
        });

        if (result.results[0]) {
          const address = result.results[0].formatted_address;
          const addressParts = address.split(',').map(part => part.trim());
          const street = addressParts[0];
          const city = addressParts[1];
          const state = addressParts[2]?.split(' ')[0];
          const displayAddress = `${street}, ${city}, ${state}`;

          setUserLocation({
            coordinates: [lng, lat],
            address: displayAddress
          });
          setMapCenter([lng, lat]);
          setMapZoom(14);
          setWeatherInfo({
            location: address,
            coordinates: [lng, lat]
          });

          if (mapServiceRef.current) {
            mapServiceRef.current.addUserLocationMarker({ lat, lng });
          }

          // Fetch weather data for initial location
          await fetchWeatherData(lat, lng, address);
        }
      } catch (error) {
        console.error('Error getting user location:', error);
      }
    };

    getUserLocation();
  }, []);

  // Update marker when user location changes
  useEffect(() => {
    if (userLocation && mapServiceRef.current) {
      const [lng, lat] = userLocation.coordinates;
      mapServiceRef.current.addUserLocationMarker({ lat, lng });
    }
  }, [userLocation]);

  // Update map center when user location changes
  useEffect(() => {
    if (userLocation) {
      setMapCenter(userLocation.coordinates);
    }
  }, [userLocation]);

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleViewOnMap = async (suggestion: ChatSuggestion) => {
    if (!mapServiceRef.current) {
      console.error('Map service not initialized');
      return;
    }

    // Clear existing routes and markers
    mapServiceRef.current.clearRoute();
    mapServiceRef.current.clearDirectionsRenderer();

    // Update map center and zoom to show the suggestion
    setMapCenter([suggestion.location.lng, suggestion.location.lat]);
    setMapZoom(15);

    // Add marker for the suggestion
    await mapServiceRef.current.addMarker(
      { lat: suggestion.location.lat, lng: suggestion.location.lng },
      {
        type: 'end',
        onClick: () => {
          const map = mapServiceRef.current?.getMap();
          if (!map) return;

          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div class="p-3">
                <h3 class="font-medium text-lg">${suggestion.name}</h3>
                <p class="text-sm text-gray-600">${suggestion.description}</p>
              </div>
            `
          });
          infoWindow.open(map);
        }
      }
    );

    // Update destination location state
    setDestinationLocation({
      coordinates: [suggestion.location.lng, suggestion.location.lat],
      address: suggestion.name
    });
  };

  const handleAddToRoute = async (suggestion: ChatSuggestion) => {
    try {
      if (!userLocation) {
        setMessages(prev => [...prev, {
          type: 'assistant',
          content: 'Please set your starting location first.'
        }]);
        return;
      }

      if (!mapServiceRef.current) {
        throw new Error('Map service not initialized');
      }

      setIsLoading(true);

      // Clear existing routes and markers
      mapServiceRef.current.clearRoute();

      // Create a destination object that matches the search box format
      const destinationInfo = {
        coordinates: [suggestion.location.lng, suggestion.location.lat],
        formatted_address: suggestion.name,
        place_name: suggestion.name
      };

      try {
        // Update the destination using the search box handler
        await handleDestinationSelect(destinationInfo);
      } catch (error) {
        console.error('Failed to update destination:', error);
        throw new Error('Failed to update destination');
      }

      const googleActivityType = mapActivityTypeToGoogle(routeType);
      
      const routeVisualization = await mapServiceRef.current.generateRoute(
        { lat: userLocation.coordinates[1], lng: userLocation.coordinates[0] },
        suggestion.location,
        {
          activityType: googleActivityType,
          alternatives: true
        }
      );

      await mapServiceRef.current.drawRoute(routeVisualization, {
        activityType: googleActivityType,
        alternatives: true
      });

      // Update mainRoute state
      const route: Route = {
        id: 'generated-route',
        name: `Route to ${suggestion.name}`,
        segments: [{
          startPoint: {
            latitude: userLocation.coordinates[1],
            longitude: userLocation.coordinates[0]
          },
          endPoint: {
            latitude: suggestion.location.lat,
            longitude: suggestion.location.lng
          },
          distance: routeVisualization.mainRoute.distance || 0,
          duration: routeVisualization.mainRoute.duration || 0
        }],
        totalMetrics: {
          distance: routeVisualization.mainRoute.distance || 0,
          duration: routeVisualization.mainRoute.duration || 0
        },
        alternatives: routeVisualization.alternatives || []
      };
      setMainRoute(route);

      // Add confirmation message to chat
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: `I've added ${suggestion.name} to your route. The journey will take approximately ${formatDuration(routeVisualization.mainRoute.duration || 0)} and cover ${formatDistance(routeVisualization.mainRoute.distance || 0)}.`
      }]);

    } catch (error) {
      console.error('Failed to add suggestion to route:', error);
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: error instanceof Error ? 
          `Sorry, I encountered an error: ${error.message}` : 
          'Sorry, I encountered an error while adding this location to your route.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="grid grid-cols-[minmax(350px,_400px)_1fr] h-full w-full overflow-hidden">
        {/* Left Panel - Chat Interface */}
        <div className="flex flex-col h-full bg-stone-900 border-r border-stone-800 overflow-hidden">
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto">
            <AIChat
              messages={messages}
              onSendMessage={handleChatMessage}
              userLocation={userLocation}
              destinationLocation={destinationLocation}
              weatherData={weatherData}
              onViewSuggestion={handleViewOnMap}
              onAddToRoute={handleAddToRoute}
              isGenerating={isGenerating}
            />
          </div>
        </div>

        {/* Right Panel - Map & Controls */}
        <div className="relative h-full w-full overflow-hidden">
          <MapView
            center={mapCenter}
            zoom={mapZoom}
            onMapClick={handleMapClick}
            showWeather={false}
            showUserLocation={true}
            darkMode={theme === 'dark'}
            onMapInit={handleMapServiceInit}
          />

          <MapToolbar 
            mapIntegration={mapServiceRef.current}
            onToolSelect={handleToolSelect}
            onPreferencesToggle={() => {}}
            showPreferences={false}
          />

          {/* Search Box Overlay */}
          <div className="absolute top-4 left-4 z-10 w-96 max-w-[calc(100%-2rem)] space-y-2">
            <SearchBox 
              onSelect={handleLocationSelect}
              placeholder="Set your starting point..."
              useCurrentLocation={true}
              initialValue={userLocation?.address || ''}
              key={`start-${userLocation?.coordinates?.join(',')}-${Date.now()}`}
              className="bg-[#1B1B1B]/95 backdrop-blur-sm border-stone-800/50"
            />
            <SearchBox 
              onSelect={handleDestinationSelect}
              placeholder="Choose destination..."
              initialValue={destinationLocation?.address || ''}
              key={`end-${destinationLocation?.coordinates?.join(',')}-${Date.now()}`}
              className="bg-[#1B1B1B]/95 backdrop-blur-sm border-stone-800/50"
            />
          </div>

          {/* Weather Widget */}
          {weatherData && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
              <div className="bg-[#1B1B1B]/95 backdrop-blur-sm rounded-lg border border-stone-800/50 px-4 py-2">
                <div className="flex items-center gap-4">
                  <div className="text-stone-200">
                    <span className="text-lg font-medium">{weatherData.temperature}°F</span>
                    <span className="text-stone-400 text-sm ml-2">{weatherData.location}</span>
                  </div>
                  <div className="text-stone-400 text-sm border-l border-stone-800/50 pl-4">
                    <div>{weatherData.conditions}</div>
                    <div>{weatherData.windSpeed} mph</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-[#1B1B1B]/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-[#1B1B1B]/95 rounded-lg border border-stone-800/50 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-stone-200">Generating route...</span>
                </div>
              </div>
            </div>
          )}

          {mainRoute && (
            <div className="absolute bottom-4 left-4 z-10 max-w-md">
              <div className="bg-[#1B1B1B]/95 backdrop-blur-sm rounded-lg border border-stone-800/50">
                {/* Route Header */}
                <div className="px-4 py-2 border-b border-stone-800/50">
                  <div className="flex items-center gap-2 text-xs text-stone-400">
                    <Map className="w-3.5 h-3.5" />
                    <span>CURRENT ROUTE</span>
                  </div>
                </div>

                {/* Route Details */}
                <div className="p-4 space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-stone-200">
                      <Clock className="w-4 h-4 text-stone-400" />
                      <span>{formatDuration(mainRoute.totalMetrics?.duration || 0)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-stone-200">
                      <Map className="w-4 h-4 text-stone-400" />
                      <span>{formatDistance(mainRoute.totalMetrics?.distance || 0)}</span>
                    </div>
                  </div>

                  {mainRoute.alternatives && mainRoute.alternatives.length > 0 && (
                    <div className="pt-3 border-t border-stone-800/50">
                      <p className="text-xs text-stone-400">
                        {mainRoute.alternatives.length} alternative{' '}
                        {mainRoute.alternatives.length === 1 ? 'route' : 'routes'} available
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}