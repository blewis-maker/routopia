'use client';

import { useState } from 'react';
import { RouteBuilder } from '@/components/route/RouteBuilder';
import { POISelector } from '@/components/route/POISelector';
import { WeatherOverlay } from '@/components/route/WeatherOverlay';
import { ActivityOptions } from '@/components/route/ActivityOptions';
import { RealTimeMap } from '@/components/route/RealTimeMap';
import { useAuth } from '@/hooks/useAuth';
import type { Route, POI, ActivityType } from '@/types';

export default function RoutePlannerPage() {
  const { session, status } = useAuth();
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);
  const [selectedPOIs, setSelectedPOIs] = useState<POI[]>([]);
  const [route, setRoute] = useState<Route | null>(null);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!session) {
    return null; // Protected by middleware, will redirect
  }

  return (
    <div className="flex h-screen">
      {/* Left Panel */}
      <div className="w-[400px] bg-stone-900 p-4 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6 text-white">Route Planner</h1>
        
        <div className="space-y-6">
          {/* Activity Options */}
          <ActivityOptions
            selectedActivity={selectedActivity}
            onActivitySelect={setSelectedActivity}
          />

          {/* Route Builder */}
          <RouteBuilder
            activity={selectedActivity}
            selectedPOIs={selectedPOIs}
            route={route}
            onRouteUpdate={setRoute}
          />

          {/* POI Selector */}
          <POISelector
            activity={selectedActivity}
            selectedPOIs={selectedPOIs}
            onPOISelect={setSelectedPOIs}
          />

          {/* Weather Overlay Controls */}
          <WeatherOverlay
            route={route}
            activity={selectedActivity}
          />
        </div>
      </div>

      {/* Map View */}
      <div className="flex-1 relative">
        <RealTimeMap
          route={route}
          pois={selectedPOIs}
          activity={selectedActivity}
          showWeather={true}
        />
      </div>
    </div>
  );
} 