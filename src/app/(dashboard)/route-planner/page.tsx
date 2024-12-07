'use client';

import { MapView } from '@/components/shared/MapView';
import { AIChat } from '@/components/shared/AIChat';
import { WeatherWidget } from '@/components/shared/WeatherWidget';

export default function RoutePlannerPage() {
  return (
    <div className="route-planner">
      <div className="route-planner__map">
        <MapView />
      </div>
      <div className="route-planner__sidebar">
        <WeatherWidget />
        <AIChat />
      </div>
    </div>
  );
} 