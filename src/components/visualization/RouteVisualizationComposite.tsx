import React from 'react';
import { MapView } from '../shared/MapView';
import { ElevationProfile } from '../ElevationProfile';
import { RouteVisualization } from '../RouteVisualization';

interface RoutePoint {
  lat: number;
  lng: number;
  elevation?: number;
}

interface Route {
  id: string;
  coordinates: RoutePoint[];
  elevation?: number;
}

interface Props {
  route?: Route;
  error?: Error;
}

export const RouteVisualizationComposite: React.FC<Props> = ({ route, error }) => {
  const hasElevationData = route?.coordinates?.some(point => point.elevation != null);

  return (
    <div className="route-visualization-composite">
      <div className="map-container h-[600px] relative">
        <MapView
          center={route?.coordinates?.[0] || [-104.9903, 39.7392]} // Default to Denver
          zoom={12}
          markers={route?.coordinates?.map(coord => ({
            id: `${coord.lat}-${coord.lng}`,
            position: [coord.lng, coord.lat],
          })) || []}
        />
      </div>
      
      {hasElevationData && (
        <div className="elevation-profile-container h-[200px] mt-4">
          <ElevationProfile
            points={route?.coordinates?.map(coord => ({
              distance: 0, // You'll need to calculate cumulative distance
              elevation: coord.elevation || 0,
            })) || []}
          />
        </div>
      )}

      {error && (
        <div className="error-container p-4 bg-red-50 border border-red-200 rounded-lg mt-4">
          <p className="text-red-600">{error.message}</p>
        </div>
      )}
    </div>
  );
}; 