'use client';

import { useState, useRef, useEffect } from 'react';
import { Route, RoutePreferences } from '@/types/route/types';
import { Location } from '@/types';
import { ActivityType } from '@/types/activity';
import { MapView } from '@/components/shared/MapView';
import { WeatherWidget } from '@/components/route-planner/WeatherWidget';
import { SearchBox } from '@/components/navigation/SearchBox';
import ChatWindow from '@/components/chat/ChatWindow';
import Image from 'next/image';
import { Coordinates } from '@/services/maps/MapServiceInterface';
import { useTheme } from 'next-themes';
import GoogleMapsLoader from '@/services/maps/GoogleMapsLoader';
import { GoogleMapsManager } from '@/services/maps/GoogleMapsManager';
import { RouteVisualization } from '@/services/maps/MapServiceInterface';
import { MapToolbar } from '@/components/map/MapToolbar';
import { MapLegend } from '@/components/map/MapLegend';

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

export default function RoutePlannerPage() {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [mainRoute, setMainRoute] = useState<Route | null>(null);
  const [tributaryRoutes, setTributaryRoutes] = useState<Route[]>([]);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [destinationLocation, setDestinationLocation] = useState<Location | null>(null);
  const [weatherInfo, setWeatherInfo] = useState<WeatherInfo | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-105.0749801, 40.5852602]); // Default to Berthoud, CO
  const [mapZoom, setMapZoom] = useState(12);
  const geocoder = useRef<google.maps.Geocoder | null>(null);
  const mapServiceRef = useRef<GoogleMapsManager | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [activeLayer, setActiveLayer] = useState<'ROUTE' | 'SEARCH' | 'TRAFFIC' | 'LAYERS' | null>(null);

  const [preferences, setPreferences] = useState<RoutePreferences>({
    activityType: ActivityType.WALK,
    weights: {
      distance: 1,
      duration: 1,
      effort: 1,
      safety: 1,
      comfort: 1
    }
  });

  const [messages, setMessages] = useState<Array<{
    type: 'user' | 'assistant';
    content: string;
  }>>([{
    type: 'assistant',
    content: "I'm here to help you plan routes in Colorado. Where would you like to go?"
  }]);

  const { theme } = useTheme();

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

          // Pass full address to fetchWeatherData
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

  const handleChatMessage = async (message: string) => {
    try {
      setMessages(prev => [...prev, { type: 'user', content: message }]);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          preferences,
          userLocation
        })
      });

      const data = await response.json();
      
      setMessages(prev => [...prev, { 
        type: 'assistant', 
        content: data.message 
      }]);

      if (data.route) {
        setMainRoute(data.route);
        // Update map center to route start
        const startPoint = data.route.segments[0].startPoint;
        setMapCenter([startPoint[0], startPoint[1]]);
        setMapZoom(13);
        
        // Update weather info for route end point
        const endPoint = data.route.segments[data.route.segments.length - 1].endPoint;
        setWeatherInfo({
          location: data.route.name,
          coordinates: [endPoint[0], endPoint[1]]
        });
      }

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: 'Sorry, I encountered an error processing your request.'
      }]);
    }
  };

  const generateRoute = async (start: [number, number], end: [number, number]) => {
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
          activityType: preferences.activityType,
          alternatives: true
        }
      );

      // Draw the route on the map
      await mapServiceRef.current.drawRoute(routeVisualization, {
        activityType: preferences.activityType,
        showTraffic: true,
        showAlternatives: true,
        isInteractive: true,
        style: {
          color: '#10b981',
          width: 4,
          opacity: 0.8
        }
      });

      // Update route state if needed
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
            distance: 0, // Will be updated from route data
            duration: 0  // Will be updated from route data
          }],
          totalMetrics: {
            distance: 0, // Will be updated from route data
            duration: 0  // Will be updated from route data
          },
          preferences
        };
        setMainRoute(route);
      }
    } catch (error) {
      console.error('Failed to generate route:', error);
    }
  };

  const handleMapClick = async (coordinates: Coordinates) => {
    if (!userLocation) {
      // If no starting point is set, use clicked location as start
      setUserLocation({
        coordinates: [coordinates.lng, coordinates.lat],
        address: 'Selected Location'
      });
    } else {
      // If starting point exists, generate route to clicked location
      const end: [number, number] = [coordinates.lng, coordinates.lat];
      await generateRoute(userLocation.coordinates, end);
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

  const handleLocationSelect = async (result: any) => {
    if (!('coordinates' in result)) return;
    
    const [lng, lat] = result.coordinates;
    // Get city and state from the full address
    const addressParts = result.place_name.split(',').map(part => part.trim());
    const street = addressParts[0];
    const city = addressParts[1];
    const state = addressParts[2]?.split(' ')[0];
    const displayAddress = `${street}, ${city}, ${state}`;
    
    console.log('Updating location:', { lng, lat, address: displayAddress });
    
    // Update map center first
    setMapCenter([lng, lat]);
    setMapZoom(14);
    
    // Update marker if map service is available
    if (mapServiceRef.current) {
      try {
        console.log('Updating marker position');
        await mapServiceRef.current.addUserLocationMarker({ lat, lng });
      } catch (error) {
        console.error('Error updating marker:', error);
      }
    }
    
    // Update state with full address
    setUserLocation({
      coordinates: [lng, lat],
      address: displayAddress
    });
    
    setWeatherInfo({
      location: result.place_name,
      coordinates: [lng, lat]
    });
    
    // Pass full location to fetchWeatherData
    fetchWeatherData(lat, lng, result.place_name);
  };

  const handleDestinationSelect = async (result: any) => {
    if (!('coordinates' in result)) return;
    
    const [lng, lat] = result.coordinates;
    const shortAddress = result.place_name.split(',')[0];
    
    setDestinationLocation({
      coordinates: [lng, lat],
      address: shortAddress
    });

    // Generate route if we have both start and end points
    if (userLocation) {
      try {
        if (!mapServiceRef.current) {
          console.error('Map service not initialized');
          return;
        }

        const startCoords = { 
          lat: userLocation.coordinates[1], 
          lng: userLocation.coordinates[0] 
        };
        const endCoords = { lat, lng };
        
        const routeVisualization = await mapServiceRef.current.generateRoute(
          startCoords,
          endCoords,
          {
            activityType: preferences.activityType === ActivityType.WALK ? 'walk' : 
                         preferences.activityType === ActivityType.BIKE ? 'bike' : 'car',
            alternatives: true
          }
        );

        // Draw the route
        await mapServiceRef.current.drawRoute(routeVisualization, {
          activityType: preferences.activityType === ActivityType.WALK ? 'walk' :
                       preferences.activityType === ActivityType.BIKE ? 'bike' : 'car',
          showTraffic: activeLayer === 'TRAFFIC',
          showAlternatives: true,
          isInteractive: true,
          style: {
            color: '#10b981',
            width: 4,
            opacity: 0.8
          }
        });

        // Update route info
        if (routeVisualization.mainRoute) {
          const route: Route = {
            id: 'generated-route',
            name: `Route to ${shortAddress}`,
            segments: [{
              startPoint: {
                latitude: userLocation.coordinates[1],
                longitude: userLocation.coordinates[0]
              },
              endPoint: {
                latitude: lat,
                longitude: lng
              },
              distance: routeVisualization.mainRoute.distance || 0,
              duration: routeVisualization.mainRoute.duration || 0
            }],
            totalMetrics: {
              distance: routeVisualization.mainRoute.distance || 0,
              duration: routeVisualization.mainRoute.duration || 0
            },
            preferences
          };
          setMainRoute(route);
        }
      } catch (error) {
        console.error('Failed to generate route:', error);
      }
    }
  };

  // Fix the route prop type error
  const routeToPass = mainRoute || undefined;

  // Add this function to fetch weather data
  const fetchWeatherData = async (lat: number, lng: number, location?: string) => {
    try {
      const response = await fetch(`/api/weather?lat=${lat}&lng=${lng}`);
      if (!response.ok) throw new Error('Failed to fetch weather');
      const data = await response.json();
      setWeatherData({
        ...data,
        location: location // Add location to weather data
      });
    } catch (error) {
      console.error('Error fetching weather:', error);
    }
  };

  const handleToolSelect = async (tool: 'ROUTE' | 'SEARCH' | 'TRAFFIC' | 'LAYERS') => {
    setActiveLayer(tool);
    
    if (tool === 'TRAFFIC' && mapServiceRef.current) {
      await mapServiceRef.current.setTrafficLayer(true, {
        showRealTime: true,
        showIncidents: true,
        showAlternatives: true
      });
    }
  };

  return (
    <div className="grid grid-cols-[minmax(350px,_400px)_1fr] h-full w-full overflow-hidden">
      {/* Left Panel - Chat Interface */}
      <div className="flex flex-col h-full bg-stone-900 border-r border-stone-800 overflow-hidden">
        <div className="flex-none flex items-center gap-2 p-4 border-b border-stone-800">
          <Image
            src="/routopia-logo.svg"
            alt="Routopia"
            width={32}
            height={32}
            className="w-8 h-8"
            priority
          />
          <h1 className="text-lg font-semibold text-white">Route Planner</h1>
        </div>
        
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-stone-700 scrollbar-track-transparent"
        >
          <ChatWindow
            messages={messages}
            onSendMessage={handleChatMessage}
          />
        </div>
      </div>

      {/* Right Panel - Map & Controls */}
      <div className="relative h-full w-full overflow-hidden">
        <MapView
          center={mapCenter}
          zoom={mapZoom}
          route={routeToPass}
          onMapClick={handleMapClick}
          showWeather={false}
          showElevation={!!mainRoute}
          showUserLocation={true}
          darkMode={theme === 'dark'}
          onMapInit={handleMapServiceInit}
        />

        {/* Add MapToolbar */}
        <MapToolbar 
          mapIntegration={mapServiceRef.current}
          onToolSelect={handleToolSelect}
        />

        {/* Add MapLegend */}
        <MapLegend 
          showRiverLegend={!!mainRoute}
          showTributaries={!!mainRoute && activeLayer === 'TRAFFIC'}
          showPOIs={activeLayer === 'LAYERS'}
        />

        {/* Search Box Overlay */}
        <div className="absolute top-4 left-4 z-10 w-96 max-w-[calc(100%-2rem)] space-y-2">
          <SearchBox 
            onSelect={handleLocationSelect}
            placeholder="Set your starting point..."
            useCurrentLocation={true}
            initialValue={userLocation?.address || ''}
            key={userLocation?.address}
          />
          <SearchBox 
            onSelect={handleDestinationSelect}
            placeholder="Choose destination..."
            initialValue={destinationLocation?.address || ''}
          />
        </div>

        {/* Weather Banner - Center Top */}
        {weatherData && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
            <div className="bg-stone-900/80 backdrop-blur-sm shadow-lg rounded-lg border border-stone-800">
              <WeatherWidget data={weatherData} />
            </div>
          </div>
        )}

        {/* Route Information Overlay */}
        {mainRoute && (
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <div className="bg-stone-900/90 rounded-lg p-4 backdrop-blur shadow-lg">
              <h3 className="text-lg font-semibold text-white mb-2">Current Route</h3>
              <div className="text-stone-300">
                <p>Distance: {Math.round(mainRoute.totalMetrics?.distance || 0)}km</p>
                <p>Duration: {Math.round((mainRoute.totalMetrics?.duration || 0) / 60)} minutes</p>
                <p>Activity: {mainRoute.preferences.activityType}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}