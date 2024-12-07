'use client';

import { MapView } from '@/components/shared/MapView';
import { WeatherWidget } from '@/components/shared/WeatherWidget';
import { AIChat } from '@/components/shared/AIChat';

export default function POIExplorerPage() {
  return (
    <div className="poi-explorer">
      <div className="poi-explorer__map">
        <MapView
          center={[-104.9903, 39.7392]}
          zoom={12}
        />
      </div>
      <div className="poi-explorer__sidebar">
        <WeatherWidget />
        <AIChat
          messages={[
            {
              role: 'assistant',
              content: "I can help you discover interesting places. What type of location are you looking for?",
            },
          ]}
        />
      </div>
    </div>
  );
} 