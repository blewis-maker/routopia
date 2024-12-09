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

  const [messages, setMessages] = useState<Array<{
    type: 'user' | 'assistant';
    content: string;
  }>>([{
    type: 'assistant',
    content: "I'm here to help you plan routes in Colorado. Where would you like to go?"
  }]);

  const handleChatMessage = async (message: string) => {
    try {
      setMessages(prev => [...prev, { type: 'user', content: message }]);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          userLocation
        })
      });

      const data = await response.json();
      
      setMessages(prev => [...prev, { 
        type: 'assistant', 
        content: data.message 
      }]);

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: 'Sorry, I encountered an error processing your request.'
      }]);
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
    const displayName = result.business_name || result.formatted_address || result.place_name;
    
    setDestinationLocation({
      coordinates: [lng, lat],
      address: displayName
    });

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

  return (
    <ErrorBoundary>
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
          
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto">
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
              key={userLocation?.address}
            />
            <SearchBox 
              onSelect={handleDestinationSelect}
              placeholder="Choose destination..."
              initialValue={destinationLocation?.address || ''}
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
        </div>
      </div>
    </ErrorBoundary>
  );
}