'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Location } from '@/types';
import { MapView } from '@/components/shared/MapView';
import { WeatherWidget } from '@/components/route-planner/WeatherWidget';
import { SearchBox } from '@/components/navigation/SearchBox';
import ChatWindow from '@/components/chat/ChatWindow';
import Image from 'next/image';
import { LatLng } from '@/types/shared';
import { MapServiceInterface, MapBounds } from '@/services/maps/MapServiceInterface';
import { useTheme } from 'next-themes';
import GoogleMapsLoader from '@/services/maps/GoogleMapsLoader';
import { GoogleMapsManager } from '@/services/maps/GoogleMapsManager';
import { MapToolbar } from '@/components/map/MapToolbar';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { Clock, Map, MapPinPlus } from 'lucide-react';
import { Route } from '@/types/route/types';
import { AIChat } from '@/components/chat/AIChat';
import { ChatMessage } from '@/types/chat/types';
import { ChatSuggestion } from '@/types/chat/types';
import { GoogleActivityType, UIActivityType } from '@/services/maps/MapServiceInterface';
import { generateId } from '@/lib/utils/index';
import { 
  RouteVisualization, 
  RouteVisualizationResponse, 
  LegacyRouteVisualization 
} from '@/types/route/visualization';
import { RouteErrorBoundary } from '@/components/error/RouteErrorBoundary';
import { MonitoringErrorBoundary } from '@/components/error/MonitoringErrorBoundary';
import { RouteMonitorPanel } from '@/components/route-planner/RouteMonitorPanel';
import { ProgressProvider } from '@/contexts/ProgressContext';
import { ProgressOverview } from '@/components/progress/ProgressOverview';
import { getRouteColor } from '@/lib/utils/routeColors';
import { MapVisualization } from '@/types/maps/visualization';
import { convertRouteToVisualization } from '@/lib/utils/routeConversion';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import { MapErrorBoundary } from '@/components/error/MapErrorBoundary';
import { HybridMapService } from '@/services/maps/HybridMapService';
import { cn } from '@/lib/utils';

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

interface RouteGenerationOptions {
  activityType?: 'car' | 'bike' | 'walk';
  alternatives?: boolean;
  waypoints?: LatLng[];
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

const mapPoint = (point: LatLng, index: number, array: LatLng[]): RouteSegment => ({
  type: 'road',
  path: [point],
  details: {
    distance: 0,
    duration: 0
  }
});

export default function RoutePlannerPage() {
  // 1. All refs
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const geocoder = useRef<google.maps.Geocoder | null>(null);
  const mapServiceRef = useRef<HybridMapService | null>(null);
  
  // 2. All state
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [destinationLocation, setDestinationLocation] = useState<Location | null>(null);
  const [weatherInfo, setWeatherInfo] = useState<WeatherInfo | null>(null);
  const [mapCenter, setMapCenter] = useState<LatLng>({ lat: 40.5852602, lng: -105.0749801 });
  const [mapZoom, setMapZoom] = useState(12);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [activeLayer, setActiveLayer] = useState<'ROUTE' | 'SEARCH' | 'TRAFFIC' | 'LAYERS' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mainRoute, setMainRoute] = useState<Route | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [routeType, setRouteType] = useState<'drive' | 'bike' | 'run' | 'ski' | 'adventure'>('drive');
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const initializationRef = useRef<boolean>(false);
  const [isWeatherVisible, setIsWeatherVisible] = useState(true);
  const [mapService, setMapService] = useState<HybridMapService | null>(null);
  const [waypoints, setWaypoints] = useState<Location[]>([]);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  // 3. All context hooks
  const { theme } = useTheme();
  const { isLoaded, error } = useGoogleMaps();

  // 4. Single useEffect for initialization
  useEffect(() => {
    let mounted = true;

    const initGoogleServices = async () => {
      if (!isLoaded || !mounted) return;

      try {
        if (!geocoder.current) {
          geocoder.current = new google.maps.Geocoder();
        }

        // Get user's location
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
            maximumAge: 0,
            enableHighAccuracy: true
          });
        });

        if (!mounted) return;

        const { latitude: lat, longitude: lng } = position.coords;

        // Reverse geocode to get address
        const result = await geocoder.current.geocode({
          location: { lat, lng }
        });

        if (!mounted) return;

        if (result.results[0]) {
          const address = result.results[0].formatted_address;
          const addressParts = address.split(',').map(part => part.trim());
          const street = addressParts[0];
          const city = addressParts[1];
          const state = addressParts[2]?.split(' ')[0];
          const displayAddress = `${street}, ${city}, ${state}`;

          if (mounted) {
            setUserLocation({
              coordinates: [lng, lat],
              address: displayAddress
            });

            setMapCenter({ lat, lng });
            setMapZoom(14);
            
            setWeatherInfo({
              location: address,
              coordinates: [lng, lat]
            });

            await fetchWeatherData(lat, lng, address);
          }
        }
      } catch (error) {
        console.error('Error initializing services:', error);
      }
    };

    initGoogleServices();

    return () => {
      mounted = false;
    };
  }, [isLoaded]); // Only depend on isLoaded

  // Update the map init handler
  const handleMapInit = async (service: HybridMapService) => {
    console.log('Map init handler called');
    mapServiceRef.current = service;
    
    // Wait for the map to be fully ready
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      if (service.isReady()) {
        console.log('Map is ready');
        setIsMapInitialized(true);
        
        // If we have a user location, add the marker now
        if (userLocation) {
          const [lng, lat] = userLocation.coordinates;
          try {
            await service.addUserLocationMarker({ lat, lng });
            console.log('Initial user location marker added');
          } catch (error) {
            console.error('Failed to add initial user location marker:', error);
          }
        }
        
        return;
      }
      
      console.log('Waiting for map to be ready...');
      await new Promise(resolve => setTimeout(resolve, 500));
      attempts++;
    }
    
    console.warn('Map failed to become ready after maximum attempts');
  };

  // Separate effect for marker updates
  useEffect(() => {
    if (!userLocation || !mapServiceRef.current) {
      return;
    }

    const addMarker = async () => {
      try {
        if (!mapServiceRef.current?.isReady()) {
          console.log('Map not ready yet, waiting...');
          return;
        }

        const [lng, lat] = userLocation.coordinates;
        console.log('Adding location marker at:', { lng, lat });
        
        await mapServiceRef.current.addUserLocationMarker({
          lat,
          lng
        });
        
        console.log('Location marker added successfully');
      } catch (error) {
        console.error('Failed to add location marker:', error);
      }
    };

    // Add marker with a slight delay to ensure map is ready
    const timer = setTimeout(addMarker, 1000);
    return () => clearTimeout(timer);
  }, [userLocation]);

  // 6. Effect for chat scrolling
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Loading and error states
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-t-teal-500 border-stone-700 rounded-full animate-spin mb-4" />
          <p>Loading map services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-red-500">
          <p>Error loading map services</p>
          <p className="text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

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
          // Format the full address
          const fullAddress = `${data.suggestion.name}, ${data.suggestion.location.address || ''}`;
          
          // Update the destination location state
          setDestinationLocation({
            coordinates: [data.suggestion.location.lng, data.suggestion.location.lat],
            address: fullAddress // Use the full address
          });

          // Update weather for the suggested location
          await fetchWeatherData(
            data.suggestion.location.lat,
            data.suggestion.location.lng,
            fullAddress
          );

          // Generate route
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

  const handleLocationSelect = async (location: Location, type: 'origin' | 'destination') => {
    if (type === 'origin') {
      setUserLocation(location);
    } else {
      setDestinationLocation(location);
    }

    // If we have both origin and destination, calculate route
    if (mapServiceRef.current && userLocation && destinationLocation) {
      try {
        const route = await mapServiceRef.current.calculateRoute({
          origin: type === 'origin' ? location : userLocation,
          destination: type === 'destination' ? location : destinationLocation,
          waypoints: [] // We can add waypoint support later
        });

        // Update route visualization
        await mapServiceRef.current.updateRouteVisualization(route);
        
        // Update route state if needed
        setMainRoute(route);
      } catch (error) {
        console.error('Failed to calculate route:', error);
      }
    }
  };

  const handleDestinationSelect = async (result: any) => {
    if (!('coordinates' in result)) return;
    
    const [lng, lat] = result.coordinates;
    // Format the full address including business name if available
    const fullAddress = result.business_name 
      ? `${result.business_name}, ${result.formatted_address}`
      : result.formatted_address;
    
    // Clear existing routes and markers
    if (mapServiceRef.current) {
      mapServiceRef.current.clearRoute();
      mapServiceRef.current.clearDirectionsRenderer();
    }
    
    // Reset main route state
    setMainRoute(null);

    // Update destination location with full address
    setDestinationLocation({
      coordinates: [lng, lat],
      address: fullAddress
    });

    // Update weather for new destination
    await fetchWeatherData(lat, lng, fullAddress);

    // Generate new route if we have a start location
    if (userLocation) {
      try {
        await generateRoute(userLocation.coordinates, [lng, lat]);
      } catch (error) {
        console.error('Failed to generate route:', error);
      }
    }
  };

  const handleToolSelect = (tool: 'ROUTE' | 'SEARCH' | 'TRAFFIC') => {
    setActiveLayer(tool);
    
    if (tool === 'TRAFFIC' && mapServiceRef.current) {
      mapServiceRef.current.setTrafficLayer(true);
    }
  };

  const fetchWeatherData = async (lat: number, lng: number, location?: string) => {
    try {
      console.log('Fetching weather for:', { lat, lng, location });
      
      const response = await fetch(`/api/weather?lat=${lat}&lng=${lng}`);
      const data = await response.json();

      if (!response.ok) {
        console.error('Weather API error response:', data);
        throw new Error(data.error || 'Failed to fetch weather');
      }

      if (!data.temperature) {
        console.error('Invalid weather data received:', data);
        throw new Error('Invalid weather data received');
      }

      setWeatherData({
        temperature: data.temperature,
        conditions: data.conditions,
        windSpeed: data.windSpeed,
        humidity: data.humidity,
        icon: data.icon,
        location: location
      });

    } catch (error) {
      console.error('Error fetching weather:', error);
      // Set a default state instead of null
      setWeatherData({
        temperature: 0,
        conditions: 'Weather unavailable',
        windSpeed: 0,
        humidity: 0,
        icon: '01d',
        location: location
      });
    }
  };

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

      // Format the full address with business name and location
      const fullAddress = `${suggestion.name}, ${suggestion.location.address}`;

      // Create a destination object that matches the search box format
      const destinationInfo = {
        coordinates: [suggestion.location.lng, suggestion.location.lat],
        formatted_address: suggestion.location.address,
        business_name: suggestion.name,
        place_name: fullAddress
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

  // Update the route conversion logic
  const convertRouteVisualization = (
    routeVisualization: RouteVisualizationResponse | LegacyRouteVisualization
  ): Route => {
    // Handle legacy format
    if ('coordinates' in routeVisualization) {
      const routeType = 'road' as RouteSegmentType;
      return {
        id: generateId(),
        name: 'Legacy Route',
        type: routeType,
        segments: [{
          type: routeType,
          path: routeVisualization.coordinates.map(([lng, lat]) => ({ lat, lng })),
          details: {
            distance: routeVisualization.distance || 0,
            duration: routeVisualization.duration || 0,
            color: getRouteColor(routeType)
          }
        }],
        metrics: {
          distance: routeVisualization.distance || 0,
          duration: routeVisualization.duration || 0,
          elevation: { gain: 0, loss: 0, max: 0, min: 0 }
        },
        waypoints: [],
        metadata: {
          totalDistance: routeVisualization.distance || 0,
          difficulty: 'moderate',
          conditions: [],
          recommendations: [],
          terrain: ['road', 'paved'],
          skillRequirements: {
            technical: ['basic-navigation'],
            physical: ['walking'],
            minimum: 'beginner',
            recommended: 'beginner'
          },
          dining: {
            preferences: {
              cuisineTypes: [],
              priceRange: [],
              dietaryRestrictions: []
            }
          },
          recreation: {
            preferences: {
              activityTypes: [],
              intensity: 'moderate',
              duration: { 
                min: 0, 
                max: routeVisualization.duration || 0 
              }
            }
          },
          scheduling: {
            preferredStopFrequency: 60,
            restStopDuration: 15
          },
          social: {
            groupSize: 1,
            familyFriendly: true,
            accessibility: []
          }
        }
      };
    }

    // Handle modern format
    return convertVisualizationToRoute(routeVisualization.mainRoute);
  };

  function convertVisualizationToRoute(
    routeVisualization: RouteVisualization,
    destinationLocation?: Location | null
  ): Route {
    const routeType = 'road' as RouteSegmentType;

    return {
      id: generateId(),
      name: `Route to ${destinationLocation?.address || 'destination'}`,
      type: routeType,
      segments: [{
        type: routeType,
        path: routeVisualization.mainRoute.coordinates,
        details: {
          distance: routeVisualization.distance,
          duration: routeVisualization.duration,
          color: getRouteColor(routeType)
        }
      }],
      metrics: {
        distance: routeVisualization.distance,
        duration: routeVisualization.duration,
        elevation: {
          gain: 0,
          loss: 0,
          max: 0,
          min: 0
        }
      },
      waypoints: generateWaypoints(routeVisualization, destinationLocation),
      metadata: {
        totalDistance: routeVisualization.distance,
        difficulty: 'moderate',
        conditions: [],
        recommendations: [],
        terrain: ['road', 'paved'],
        skillRequirements: {
          technical: ['basic-navigation'],
          physical: ['walking'],
          minimum: 'beginner',
          recommended: 'beginner'
        },
        dining: {
          preferences: {
            cuisineTypes: [],
            priceRange: [],
            dietaryRestrictions: []
          }
        },
        recreation: {
          preferences: {
            activityTypes: [],
            intensity: 'moderate',
            duration: { min: 0, max: routeVisualization.duration }
          }
        },
        scheduling: {
          preferredStopFrequency: 60,
          restStopDuration: 15
        },
        social: {
          groupSize: 1,
          familyFriendly: true,
          accessibility: []
        }
      }
    };
  }

  function generateWaypoints(
    visualization: RouteVisualization, 
    destination?: Location | null
  ): WaypointType[] {
    const waypoints: WaypointType[] = [];

    // Add start waypoint
    if (visualization.mainRoute.coordinates.length > 0) {
      const start = visualization.mainRoute.coordinates[0];
      waypoints.push({
        type: 'parking',
        location: start,
        name: 'Starting Point'
      });
    }

    // Add destination waypoint
    if (destination) {
      waypoints.push({
        type: 'destination',
        location: {
          lat: destination.coordinates[0],
          lng: destination.coordinates[1]
        },
        name: destination.address
      });
    }

    return waypoints;
  }

  const handleRouteVisualization = async (route: Route) => {
    if (!mapServiceRef.current) return;

    try {
      const visualization = convertRouteToVisualization(route);
      await mapServiceRef.current.visualizeRoute(visualization);
    } catch (error) {
      console.error('Failed to visualize route:', error);
    }
  };

  const handleRouteUpdate = (route: {
    origin: Location;
    destination: Location;
    waypoints: Location[];
    path: any;
  }) => {
    console.log('Route updated:', route);
    // We can integrate this with your existing route state management
  };

  // Add waypoint management
  const addWaypoint = () => {
    setWaypoints([...waypoints]);
  };

  const removeWaypoint = (index: number) => {
    const newWaypoints = waypoints.filter((_, i) => i !== index);
    setWaypoints(newWaypoints);
    updateRoute();
  };

  // Update the route calculation to include waypoints
  const updateRoute = async () => {
    if (!mapServiceRef.current || !userLocation || !destinationLocation) return;
    
    setIsCalculatingRoute(true);
    try {
      const route = await mapServiceRef.current.calculateRoute({
        origin: userLocation,
        destination: destinationLocation,
        waypoints: waypoints.filter(wp => wp !== null)
      });

      await mapServiceRef.current.updateRouteVisualization(route);
      setMainRoute(route);
    } catch (error) {
      console.error('Failed to calculate route:', error);
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  return (
    <ProgressProvider>
      <ErrorBoundary>
        <div className="grid grid-cols-[minmax(350px,_400px)_1fr] h-full w-full overflow-hidden">
          {/* Left Panel - Chat Interface */}
          <div className="flex flex-col h-full bg-stone-900 border-r border-stone-800 overflow-hidden">
            <RouteErrorBoundary>
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
            </RouteErrorBoundary>
          </div>

          {/* Right Panel - Map & Controls */}
          <div className="relative h-full w-full overflow-hidden">
            <MapErrorBoundary>
              <MapView
                options={{
                  center: mapCenter,
                  zoom: mapZoom
                }}
                showWeather={isWeatherVisible}
                showUserLocation={true}
                darkMode={theme === 'dark'}
                onMapInit={handleMapInit}
              />
            </MapErrorBoundary>

            {isMapInitialized && ( // Only show UI when map is initialized
              <>
                <MapToolbar 
                  mapIntegration={mapServiceRef.current}
                  onToolSelect={handleToolSelect}
                  onPreferencesToggle={() => {}}
                  showPreferences={false}
                />

                {/* Search Box Overlay */}
                <div className="absolute top-4 left-4 z-10 w-96 max-w-[calc(100%-2rem)] space-y-2">
                  <ErrorBoundary>
                    <SearchBox 
                      onSelect={(location) => handleLocationSelect(location, 'origin')}
                      placeholder="Set your starting point..."
                      isLoading={isCalculatingRoute}
                      initialValue={userLocation?.address || ''}
                      key={`start-${userLocation?.coordinates?.join(',')}-${Date.now()}`}
                      className="bg-[#1B1B1B]/95 backdrop-blur-sm border-stone-800/50"
                      isLocationSet={!!userLocation}
                    />
                  </ErrorBoundary>
                  <ErrorBoundary>
                    <SearchBox 
                      onSelect={(location) => handleLocationSelect(location, 'destination')}
                      placeholder="Choose destination..."
                      isLoading={isCalculatingRoute}
                      initialValue={destinationLocation?.address || ''}
                      key={`end-${destinationLocation?.coordinates?.join(',')}-${Date.now()}`}
                      className="bg-[#1B1B1B]/95 backdrop-blur-sm border-stone-800/50"
                    />
                  </ErrorBoundary>
                  
                  {waypoints.map((waypoint, index) => (
                    <div key={index} className="relative">
                      <SearchBox 
                        onSelect={(location) => {
                          const newWaypoints = [...waypoints];
                          newWaypoints[index] = location;
                          setWaypoints(newWaypoints);
                          updateRoute();
                        }}
                        placeholder={`Stop ${index + 1}`}
                        isLoading={isCalculatingRoute}
                        className="bg-[#1B1B1B]/95 backdrop-blur-sm border-stone-800/50"
                      />
                      <button
                        onClick={() => removeWaypoint(index)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 -translate-x-full mr-2 
                                   text-stone-400 hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  
                  {waypoints.length < 5 && (
                    <button 
                      onClick={addWaypoint}
                      className={cn(
                        "flex items-center gap-2",
                        "px-3 py-1.5",
                        "text-sm text-stone-300",
                        "bg-[#1B1B1B]",
                        "border border-stone-800",
                        "rounded",
                        "transition-all duration-200",
                        "hover:bg-stone-800",
                        "hover:text-teal-500",
                        "hover:shadow-[0_0_8px_rgba(45,212,191,0.3)]",
                        "active:translate-y-[1px]",
                        "group"
                      )}
                    >
                      <MapPinPlus className={cn(
                        "w-4 h-4",
                        "transition-colors duration-200",
                        "group-hover:text-teal-500",
                        "group-hover:animate-pulse-analog"
                      )} />
                      <span className="font-medium tracking-wide">Add stop</span>
                    </button>
                  )}
                </div>

                {/* Weather Widget */}
                {weatherData && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
                    <WeatherWidget data={weatherData} />
                  </div>
                )}
              </>
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
              <MonitoringErrorBoundary>
                <RouteMonitorPanel
                  route={mainRoute}
                  onAlert={handleMonitoringAlert}
                />
              </MonitoringErrorBoundary>
            )}
          </div>
        </div>
      </ErrorBoundary>
      <ProgressOverview />
    </ProgressProvider>
  );
}