import React, { useEffect, useState } from 'react';
import { BaseVisualizationLayer } from '../BaseVisualizationLayer';
import { useRouteVisualizationStore } from '@/store/visualization/routeVisualization.store';
import type { RouteVisualizationProps } from '@/types/components/RouteVisualization.types';

export const WeatherOverlay: React.FC<RouteVisualizationProps> = (props) => {
  const store = useRouteVisualizationStore();
  const [weatherData, setWeatherData] = useState(props.overlays.weather);

  useEffect(() => {
    // Set up real-time weather updates
    const updateInterval = setInterval(() => {
      updateWeatherData();
    }, 300000); // Update every 5 minutes

    return () => clearInterval(updateInterval);
  }, []);

  return (
    <BaseVisualizationLayer {...props}>
      <div className="weather-overlay-container">
        {weatherData?.data.map((point) => (
          <WeatherPoint
            key={`${point.position.lat}-${point.position.lng}`}
            data={point}
            theme={props.theme}
          />
        ))}
      </div>
    </BaseVisualizationLayer>
  );
}; 