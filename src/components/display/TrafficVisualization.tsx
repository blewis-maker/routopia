import React, { useEffect, useState } from 'react';
import { TrafficData } from '@/types/routes';

interface Props {
  routeGeometry: [number, number][];
  onTrafficUpdate: (trafficData: TrafficData) => void;
}

export const TrafficVisualization: React.FC<Props> = ({
  routeGeometry,
  onTrafficUpdate
}) => {
  const [trafficData, setTrafficData] = useState<TrafficData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrafficData = async () => {
      try {
        const response = await fetch('/api/traffic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ geometry: routeGeometry })
        });
        
        const data = await response.json();
        setTrafficData(data);
        onTrafficUpdate(data);
      } catch (error) {
        console.error('Failed to fetch traffic data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (routeGeometry.length > 0) {
      fetchTrafficData();
    }
  }, [routeGeometry, onTrafficUpdate]);

  if (loading || !trafficData) return null;

  return (
    <div className="traffic-visualization absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm p-4 rounded-lg text-white">
      <h3 className="text-sm font-semibold mb-2">Traffic Conditions</h3>
      <div className="space-y-2">
        {trafficData.segments.map((segment, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getTrafficColor(segment.level)}`} />
            <span className="text-xs">
              {segment.distance.toFixed(1)}km - {getTrafficLabel(segment.level)}
            </span>
          </div>
        ))}
      </div>
      {trafficData.delay > 0 && (
        <div className="mt-3 text-xs text-amber-400">
          Expected delay: {formatDelay(trafficData.delay)}
        </div>
      )}
    </div>
  );
};

function getTrafficColor(level: string): string {
  const colors = {
    low: 'bg-green-500',
    moderate: 'bg-yellow-500',
    heavy: 'bg-red-500'
  };
  return colors[level as keyof typeof colors] || colors.low;
}

function getTrafficLabel(level: string): string {
  const labels = {
    low: 'Light Traffic',
    moderate: 'Moderate Traffic',
    heavy: 'Heavy Traffic'
  };
  return labels[level as keyof typeof labels] || 'Unknown';
}

function formatDelay(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} mins`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
} 