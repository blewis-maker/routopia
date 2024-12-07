'use client';

import { ActivityTracker } from '@/components/shared/ActivityTracker';
import { WeatherWidget } from '@/components/shared/WeatherWidget';
import { AIChat } from '@/components/shared/AIChat';

export default function ActivityHubPage() {
  return (
    <div className="activity-hub">
      <div className="activity-hub__main">
        <ActivityTracker />
      </div>
      <div className="activity-hub__sidebar">
        <WeatherWidget />
        <AIChat />
      </div>
    </div>
  );
} 