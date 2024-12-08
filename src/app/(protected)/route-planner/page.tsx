'use client';

import { useState, useRef, useEffect } from 'react';
import { Route, RoutePreferences } from '@/types/route/types';
import { Location } from '@/types';
import { ActivityType } from '@/types/activity';
import { MapView } from '@/components/shared/MapView';
import { WeatherWidget } from '@/components/dashboard/WeatherWidget';
import { SearchBox } from '@/components/navigation/SearchBox';
import ChatWindow from '@/components/chat/ChatWindow';
import Image from 'next/image';
import { Coordinates } from '@/services/maps/MapServiceInterface';
import { useTheme } from 'next-themes';
import GoogleMapsLoader from '@/services/maps/GoogleMapsLoader';

interface WeatherInfo {
  location: string;
  coordinates: [number, number];
}

export default function RoutePlannerPage() {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [mainRoute, setMainRoute] = useState<Route | null>(null);
  const [tributaryRoutes, setTributaryRoutes] = useState<Route[]>([]);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [weatherInfo, setWeatherInfo] = useState<WeatherInfo | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-105.0749801, 40.5852602]); // Default to Berthoud, CO
  const [mapZoom, setMapZoom] = useState(12);
  const geocoder = useRef<google.maps.Geocoder | null>(null);

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

  // Get initial user location
  useEffect(() => {
    const getUserLocation = async () => {
      if (!geocoder.current) return;

      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        const { latitude: lat, longitude: lng } = position.coords;
        
        // Reverse geocode the coordinates
        const result = await geocoder.current.geocode({
          location: { lat, lng }
        });

        if (result.results[0]) {
          const address = result.results[0].formatted_address;
          
          // Update state as if user selected this location
          setUserLocation({
            coordinates: [lng, lat],
            address
          });
          setMapCenter([lng, lat]);
          setMapZoom(14);
          setWeatherInfo({
            location: address,
            coordinates: [lng, lat]
          });
        }
      } catch (error) {
        console.error('Error getting location:', error);
      }
    };

    getUserLocation();
  }, [geocoder.current]);

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

  const handleMapClick = async (coordinates: Coordinates) => {
    if (!userLocation) {
      // If no starting point is set, use clicked location as start
      setUserLocation({
        coordinates: [coordinates.lng, coordinates.lat],
        address: 'Selected Location'
      });
    } else {
      // If starting point exists, generate route to clicked location
      try {
        const response = await fetch('/api/routes/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            start: userLocation.coordinates,
            end: [coordinates.lng, coordinates.lat],
            preferences
          })
        });

        const data = await response.json();
        if (data.route) {
          setMainRoute(data.route);
          setWeatherInfo({
            location: data.route.name,
            coordinates: [coordinates.lng, coordinates.lat]
          });
        }
      } catch (error) {
        console.error('Route generation error:', error);
      }
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
          route={mainRoute}
          onMapClick={handleMapClick}
          showWeather={!!weatherInfo}
          showElevation={!!mainRoute}
          showUserLocation={true}
          darkMode={theme === 'dark'}
        />

        {/* Search Box Overlay */}
        <div className="absolute top-4 left-4 z-10 w-96 max-w-[calc(100%-2rem)]">
          <SearchBox 
            onSelect={(result) => {
              if ('coordinates' in result) {
                const [lng, lat] = result.coordinates;
                setUserLocation({
                  coordinates: [lng, lat],
                  address: result.place_name
                });
                setMapCenter([lng, lat]);
                setMapZoom(14);
                setWeatherInfo({
                  location: result.place_name,
                  coordinates: [lng, lat]
                });
              }
            }}
            placeholder="Set your starting point..."
            useCurrentLocation={true}
            initialValue={userLocation?.address || ''}
          />
        </div>

        {/* Weather Overlay */}
        {weatherInfo && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
            <div className="bg-stone-900/90 rounded-lg backdrop-blur shadow-lg">
              <WeatherWidget 
                coordinates={{
                  lat: weatherInfo.coordinates[1],
                  lng: weatherInfo.coordinates[0]
                }}
              />
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