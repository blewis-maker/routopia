'use client';

import { MapView } from '@/components/shared/MapView';
import { WeatherWidget } from '@/components/shared/WeatherWidget';
import { AIChat } from '@/components/shared/AIChat';

export default function POIExplorerPage() {
  return (
    <div className="poi-explorer">
      <div className="poi-explorer__map">
        <MapView />
      </div>
      <div className="poi-explorer__sidebar">
        <WeatherWidget />
        <AIChat />
      </div>
    </div>
  );
} 