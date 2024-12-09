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

  const handleChatMessage = async (message: string) => {
    try {
      setMessages(prev => [...prev, { type: 'user', content: message }]);
      setMessages(prev => [...prev, { type: 'assistant', content: '...' }]);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          context: {
            start: userLocation?.address || null,
            message, // Include the user's message for context
            mode: 'car',
            weather: weatherData ? {
              temperature: weatherData.temperature || 0,
              conditions: weatherData.conditions || 'unknown',
              windSpeed: weatherData.windSpeed || 0
            } : null
          }
        })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to process request');

      // Remove typing indicator and add AI response
      setMessages(prev => {
        const newMessages = prev.filter(msg => msg.content !== '...');
        return [...newMessages, { 
          type: 'assistant', 
          content: data.message
        }];
      });

      // If we have a suggestion, automatically generate the route
      if (data.suggestion) {
        await handleAddToRoute(data.suggestion);
      }

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => {
        const newMessages = prev.filter(msg => msg.content !== '...');
        return [...newMessages, {
          type: 'assistant',
          content: error instanceof Error ? 
            `I apologize, but I encountered an error: ${error.message}` : 
            'I apologize, but I encountered an unexpected error.'
        }];
      });
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
    setIsLoading(true);
    try {
      if (!mapServiceRef.current) {
        console.error('Map service not initialized');
        return;
      }

      const startCoords = { lat: start[1], lng: start[0] };
      const endCoords = { lat: end[1], lng: end[0] };
      
      const routeVisualization = await mapServiceRef.current.generateRoute(
        startCoords,
        endCoords,
        {
          activityType: 'car',
          alternatives: true
        }
      );

      await mapServiceRef.current.drawRoute(routeVisualization, {
        activityType: 'car',
        showTraffic: true,
        showAlternatives: true,
        isInteractive: true
      });

      // Set mainRoute state with route information
      if (routeVisualization.mainRoute) {
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
          ...(routeVisualization.alternatives && {
            alternatives: routeVisualization.alternatives
          })
        };
        setMainRoute(route);
      }

    } catch (error) {
      console.error('Failed to generate route:', error);
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
      mapServiceRef.current.clearDirectionsRenderer();

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

      // Generate route from current location to suggestion
      const routeVisualization = await mapServiceRef.current.generateRoute(
        { lat: userLocation.coordinates[1], lng: userLocation.coordinates[0] },
        suggestion.location,
        {
          activityType: 'car',
          alternatives: true
        }
      );

      if (!routeVisualization || !routeVisualization.mainRoute) {
        throw new Error('Failed to generate route visualization');
      }

      // Draw the route
      await mapServiceRef.current.drawRoute(routeVisualization, {
        activityType: 'car',
        showTraffic: true,
        showAlternatives: true,
        isInteractive: true
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
            />
            <SearchBox 
              onSelect={handleDestinationSelect}
              placeholder="Choose destination..."
              initialValue={destinationLocation?.address || ''}
              key={`end-${destinationLocation?.coordinates?.join(',')}-${Date.now()}`}
            />
          </div>

          {/* Weather Widget */}
          {weatherData && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
              <WeatherWidget data={weatherData} />
            </div>
          )}

          {/* Loading Overlay */}
          {isLoading && (
            <LoadingOverlay message="Generating route..." />
          )}

          {mainRoute && (
            <div className="absolute bottom-4 left-4 z-10 max-w-md">
              <div className="bg-stone-900/90 rounded-lg p-4 backdrop-blur shadow-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Current Route</h3>
                <div className="text-stone-300 space-y-1">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{formatDuration(mainRoute.totalMetrics?.duration || 0)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Map className="w-4 h-4" />
                    <span>{formatDistance(mainRoute.totalMetrics?.distance || 0)}</span>
                  </div>
                  {mainRoute.alternatives && mainRoute.alternatives.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-stone-700">
                      <p className="text-sm text-stone-400">
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