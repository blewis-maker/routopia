'use client';

import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { Location } from '@/types';
import { RoutePanel } from './RoutePanel';
import 'mapbox-gl/dist/mapbox-gl.css';
import { ChatWindow } from './ChatWindow';

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="h-screen flex items-center justify-center bg-stone-900">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
    </div>
  )
});

export default function RoutesWrapper() {
  const { status } = useSession();
  const router = useRouter();
  const [showRoutePanel, setShowRoutePanel] = useState(false);
  const [startLocation, setStartLocation] = useState<Location | null>(null);
  const [endLocation, setEndLocation] = useState<Location | null>(null);
  const [waypoints, setWaypoints] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [destinationFromChat, setDestinationFromChat] = useState<string>('');
  const [settings, setSettings] = useState({
    map: {
      showTraffic: true,
      show3DBuildings: true,
      style: 'dark',
      language: 'en',
      zoom: 12
    },
    display: {
      units: 'metric',
      highContrast: false,
      enableAnimations: true,
      fontSize: 'medium',
      theme: 'dark'
    },
    notifications: {
      routeUpdates: true,
      trafficAlerts: true,
      weatherAlerts: true,
      sound: true,
      vibration: true
    }
  });

  useEffect(() => {
    if (status === "authenticated") {
      setIsLoading(false);
    } else if (status === "unauthenticated") {
      router.push('/?signin=true');
    }
  }, [status, router]);

  if (isLoading || status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center bg-stone-900">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  const handleLocationSelect = (location: Location, type: 'start' | 'end' | 'waypoint') => {
    switch (type) {
      case 'start':
        setStartLocation(location);
        break;
      case 'end':
        setEndLocation(location);
        break;
      case 'waypoint':
        setWaypoints([...waypoints, location]);
        break;
    }
  };

  const handleDestinationFromChat = (destination: string) => {
    setDestinationFromChat(destination);
    if (destination) {
      handleLocationSelect({
        address: destination,
        coordinates: [0, 0]
      }, 'end');
    }
  };

  return (
    <div className="relative h-screen">
      <Map 
        startLocation={startLocation}
        endLocation={endLocation}
        waypoints={waypoints}
        onLocationSelect={handleLocationSelect}
        onPlanRoute={() => setShowRoutePanel(true)}
        destinationFromChat={destinationFromChat}
        settings={settings}
        onSettingsChange={setSettings}
      />
      <ChatWindow
        onSendMessage={(message) => {
          // Handle message if needed
        }}
        onDestinationChange={handleDestinationFromChat}
      />
      {showRoutePanel && (
        <RoutePanel
          onClose={() => setShowRoutePanel(false)}
          startLocation={startLocation}
          endLocation={endLocation}
          waypoints={waypoints}
          onStartLocationChange={(location) => handleLocationSelect(location, 'start')}
          onEndLocationChange={(location) => handleLocationSelect(location, 'end')}
          onWaypointAdd={(location) => handleLocationSelect(location, 'waypoint')}
        />
      )}
    </div>
  );
} 