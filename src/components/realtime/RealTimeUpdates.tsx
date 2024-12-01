import React, { useEffect } from 'react';
import { useRealTimeStore } from '@/store/realtime/realtime.store';
import { WeatherService } from './services/WeatherService';
import { TrafficService } from './services/TrafficService';
import { ConditionMonitor } from './services/ConditionMonitor';

export const RealTimeUpdates: React.FC = () => {
  const store = useRealTimeStore();

  useEffect(() => {
    const updateInterval = setInterval(() => {
      store.updateAll();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(updateInterval);
  }, []);

  return (
    <div className="realtime-updates" data-testid="realtime-updates">
      <WeatherService 
        data={store.weather}
        onUpdate={store.updateWeather}
      />
      
      <TrafficService 
        data={store.traffic}
        onUpdate={store.updateTraffic}
      />
      
      <ConditionMonitor 
        conditions={store.conditions}
        onUpdate={store.updateConditions}
      />
    </div>
  );
}; 