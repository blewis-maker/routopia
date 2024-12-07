import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  trend,
}) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <div className="flex items-end justify-between">
        <div className="text-2xl font-semibold">{value}</div>
        {trend && (
          <div
            className={`flex items-center text-sm ${
              trend.direction === 'up'
                ? 'text-green-500'
                : trend.direction === 'down'
                ? 'text-red-500'
                : 'text-gray-500'
            }`}
          >
            {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'}
            <span className="ml-1">{trend.value}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard; 