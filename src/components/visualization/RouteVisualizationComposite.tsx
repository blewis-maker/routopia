import React from 'react';
import { MapView } from '../shared/MapView';
import { ElevationProfile } from './ElevationProfile';

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

  // Convert coordinates to MapView format
  const mapCenter = route?.coordinates?.[0] 
    ? [route.coordinates[0].lng, route.coordinates[0].lat] as [number, number]
    : [-104.9903, 39.7392] as [number, number]; // Default to Denver

  const mapMarkers = route?.coordinates?.map(coord => ({
    id: `${coord.lat}-${coord.lng}`,
    position: [coord.lng, coord.lat] as [number, number],
  })) || [];

  const mapRoute = route?.coordinates ? {
    coordinates: route.coordinates.map(coord => [coord.lng, coord.lat] as [number, number]),
    color: '#10B981',
  } : undefined;

  return (
    <div className="route-visualization-composite">
      <div className="map-container h-[600px] relative">
        <MapView
          center={mapCenter}
          zoom={12}
          markers={mapMarkers}
          route={mapRoute}
        />
      </div>
      
      {hasElevationData && (
        <div className="elevation-profile-container h-[200px] mt-4">
          <ElevationProfile
            points={route?.coordinates?.map((coord, index, array) => ({
              distance: index === 0 ? 0 : calculateDistance(array[index - 1], coord),
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

// Helper function to calculate distance between two points in kilometers
function calculateDistance(point1: RoutePoint, point2: RoutePoint): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(point2.lat - point1.lat);
  const dLon = toRad(point2.lng - point1.lng);
  const lat1 = toRad(point1.lat);
  const lat2 = toRad(point2.lat);

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
} 