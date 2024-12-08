'use client';

import { MapView } from '@/components/shared/MapView';
import { WeatherWidget } from '@/components/shared/WeatherWidget';
import { AIChat } from '@/components/shared/AIChat';

export default function RoutePlannerPage() {
  return (
    <div className="route-planner">
      <div className="route-planner__map">
        <MapView
          center={[-104.9903, 39.7392]} // Default to Denver
          zoom={12}
        />
      </div>
      <div className="route-planner__sidebar">
        <WeatherWidget />
        <AIChat
          messages={[
            {
              role: 'assistant',
              content: "I'm here to help you plan your route. Where would you like to go?",
            },
          ]}
        />
      </div>
    </div>
  );
} 