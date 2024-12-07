import React from 'react';

interface LegendItem {
  color: string;
  label: string;
  type: 'route' | 'tributary' | 'poi';
  icon?: React.ReactNode;
}

interface MapLegendProps {
  items?: LegendItem[];
  className?: string;
}

const defaultItems: LegendItem[] = [
  {
    color: '#2563EB',
    label: 'Main Route',
    type: 'route',
  },
  {
    color: '#10B981',
    label: 'Scenic Tributary',
    type: 'tributary',
  },
  {
    color: '#8B5CF6',
    label: 'Cultural Tributary',
    type: 'tributary',
  },
  {
    color: '#F59E0B',
    label: 'Activity Tributary',
    type: 'tributary',
  },
];

export const MapLegend: React.FC<MapLegendProps> = ({
  items = defaultItems,
  className = '',
}) => {
  return (
    <div className={`bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 ${className}`}>
      <h3 className="text-sm font-medium text-gray-900 mb-2">Legend</h3>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            {item.type === 'route' ? (
              <div
                className="w-6 h-1 rounded-full"
                style={{ backgroundColor: item.color }}
              />
            ) : item.type === 'tributary' ? (
              <div
                className="w-6 h-0.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
            ) : (
              <div
                className="w-3 h-3 rounded-full border-2 border-white"
                style={{ backgroundColor: item.color }}
              />
            )}
            <span className="text-sm text-gray-700">{item.label}</span>
            {item.icon && (
              <span className="text-gray-400">{item.icon}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}; 