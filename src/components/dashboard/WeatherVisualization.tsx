import React from 'react';

interface WeatherData {
  temperature: number;
  condition: string;
  windSpeed: number;
  humidity: number;
}

interface WeatherVisualizationProps {
  data: WeatherData;
}

export const WeatherVisualization: React.FC<WeatherVisualizationProps> = ({
  data,
}) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Weather Conditions</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Temperature</p>
          <p className="font-medium">{data.temperature}°C</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Condition</p>
          <p className="font-medium capitalize">{data.condition}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Wind Speed</p>
          <p className="font-medium">{data.windSpeed} km/h</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Humidity</p>
          <p className="font-medium">{data.humidity}%</p>
        </div>
      </div>
    </div>
  );
};

export default WeatherVisualization; 