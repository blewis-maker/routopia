'use client';

import React from 'react';

interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  precipitation: number;
  windSpeed: number;
  humidity: number;
}

interface WeatherWidgetProps {
  data?: WeatherData;
  loading?: boolean;
  error?: string;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  data,
  loading = false,
  error,
}) => {
  const mockData: WeatherData = {
    temperature: 72,
    condition: 'Partly Cloudy',
    icon: '⛅',
    precipitation: 10,
    windSpeed: 5,
    humidity: 45,
  };

  const displayData = data || mockData;

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 shadow-lg animate-pulse">
        <div className="space-y-3">
          <div className="h-6 bg-neutral-200 dark:bg-neutral-800 rounded w-24" />
          <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-16" />
          <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-20" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 shadow-lg">
      <div className="flex items-center space-x-3">
        <span className="text-4xl">{displayData.icon}</span>
        <div>
          <div className="text-2xl font-semibold text-neutral-900 dark:text-white">
            {displayData.temperature}°F
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            {displayData.condition}
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-neutral-600 dark:text-neutral-400">Precipitation</span>
          <span className="text-neutral-900 dark:text-white">{displayData.precipitation}%</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-neutral-600 dark:text-neutral-400">Wind</span>
          <span className="text-neutral-900 dark:text-white">{displayData.windSpeed} mph</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-neutral-600 dark:text-neutral-400">Humidity</span>
          <span className="text-neutral-900 dark:text-white">{displayData.humidity}%</span>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget; 