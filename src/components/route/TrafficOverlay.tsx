import React from 'react';
import { TrafficData } from '@/services/maps/MapServiceInterface';

export interface TrafficOverlayProps {
  routeId: string;
  trafficData: TrafficData[];
  isVisible: boolean;
  onClose: () => void;
}

export const TrafficOverlay: React.FC<TrafficOverlayProps> = ({
  routeId,
  trafficData,
  isVisible,
  onClose
}) => {
  if (!isVisible) return null;

  return (
    <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow p-4 max-w-sm">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-semibold">Traffic Conditions</h4>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>
      <div className="space-y-2">
        {trafficData.map((data, index) => (
          <div key={index}>
            {/* Overall congestion */}
            <div className={`p-2 rounded ${
              data.congestionLevel === 'high' 
                ? 'bg-red-100 text-red-700'
                : data.congestionLevel === 'medium'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-green-100 text-green-700'
            }`}>
              <p className="text-sm font-medium">
                {data.congestionLevel === 'high' ? 'Heavy Traffic'
                  : data.congestionLevel === 'medium' ? 'Moderate Traffic'
                  : 'Light Traffic'}
              </p>
            </div>

            {/* Incidents */}
            {data.incidents.length > 0 && (
              <div className="mt-2 space-y-1">
                <p className="text-xs font-medium text-gray-500">Incidents:</p>
                {data.incidents.map((incident, i) => (
                  <div 
                    key={i}
                    className={`text-sm p-1.5 rounded ${
                      incident.severity === 'high'
                        ? 'bg-red-50 text-red-600'
                        : incident.severity === 'medium'
                        ? 'bg-yellow-50 text-yellow-600'
                        : 'bg-green-50 text-green-600'
                    }`}
                  >
                    <p className="text-xs">{incident.description}</p>
                    {incident.startTime && (
                      <p className="text-xs opacity-75">
                        Started: {new Date(incident.startTime).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrafficOverlay; 