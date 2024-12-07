'use client';

import React from 'react';

interface WeatherWidgetProps {
  temperature?: number;
  conditions?: string;
  location?: string;
  isLoading?: boolean;
  error?: string;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  temperature = 20,
  conditions = 'Clear',
  location = 'New York, NY',
  isLoading = false,
  error
}) => {
  if (isLoading) {
    return <div className="weather-widget loading">Loading weather data...</div>;
  }

  if (error) {
    return <div className="weather-widget error">{error}</div>;
  }

  return (
    <div className="weather-widget">
      <div className="location">{location}</div>
      <div className="temperature">{temperature}°C</div>
      <div className="conditions">{conditions}</div>
    </div>
  );
};

export default WeatherWidget; 