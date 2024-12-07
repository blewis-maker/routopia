import React, { useState, useEffect } from 'react';

interface TrafficData {
  severity: 'low' | 'medium' | 'high';
  description: string;
  location: {
    lat: number;
    lng: number;
  };
}

interface TrafficOverlayProps {
  routeId: string;
  onTrafficUpdate?: (data: TrafficData[]) => void;
}

export const TrafficOverlay: React.FC<TrafficOverlayProps> = ({
  routeId,
  onTrafficUpdate,
}) => {
  const [trafficData, setTrafficData] = useState<TrafficData[]>([]);

  useEffect(() => {
    // Mock traffic data
    const mockData: TrafficData[] = [
      {
        severity: 'low',
        description: 'Light traffic conditions',
        location: { lat: 40.7128, lng: -74.0060 },
      },
      {
        severity: 'medium',
        description: 'Moderate congestion ahead',
        location: { lat: 40.7129, lng: -74.0061 },
      },
    ];

    setTrafficData(mockData);
    onTrafficUpdate?.(mockData);
  }, [routeId, onTrafficUpdate]);

  return (
    <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow p-4 max-w-sm">
      <h4 className="text-sm font-semibold mb-2">Traffic Conditions</h4>
      <div className="space-y-2">
        {trafficData.map((item, index) => (
          <div
            key={index}
            className={`p-2 rounded ${
              item.severity === 'high'
                ? 'bg-red-100 text-red-700'
                : item.severity === 'medium'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-green-100 text-green-700'
            }`}
          >
            <p className="text-sm">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrafficOverlay; 