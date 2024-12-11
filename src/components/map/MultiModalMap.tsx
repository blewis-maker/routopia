'use client';

import { useEffect, useRef } from 'react';
import { GoogleMap, Polyline, Marker } from '@react-google-maps/api';
import { CombinedRoute, RouteSegment, RouteWaypoint } from '@/types/combinedRoute';

const segmentColors = {
  road: '#4285F4',   // Google Blue
  trail: '#34A853',  // Nature Green
  ski: '#EA4335'     // Attention Red
};

const waypointIcons = {
  parking: '/icons/parking.svg',
  trailhead: '/icons/trailhead.svg',
  resort: '/icons/resort.svg',
  destination: '/icons/destination.svg'
};

interface MultiModalMapProps {
  route: CombinedRoute;
  onWaypointClick?: (waypoint: RouteWaypoint) => void;
  onSegmentClick?: (segment: RouteSegment) => void;
}

export function MultiModalMap({ route, onWaypointClick, onSegmentClick }: MultiModalMapProps) {
  const mapRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    if (mapRef.current && route.segments.length > 0) {
      // Fit map bounds to include all segments
      const bounds = new google.maps.LatLngBounds();
      route.segments.forEach(segment => {
        segment.path.forEach(point => {
          bounds.extend(new google.maps.LatLng(point.lat, point.lng));
        });
      });
      mapRef.current.fitBounds(bounds);
    }
  }, [route]);

  return (
    <GoogleMap
      mapContainerClassName="w-full h-[600px]"
      onLoad={(map: google.maps.Map) => {
        mapRef.current = map;
        return Promise.resolve();
      }}
      options={{
        mapTypeId: 'terrain',
        mapTypeControl: true,
        mapTypeControlOptions: {
          mapTypeIds: ['roadmap', 'terrain', 'satellite']
        }
      }}
    >
      {/* Render route segments */}
      {route.segments.map((segment, index) => (
        <Polyline
          key={`segment-${index}`}
          path={segment.path}
          options={{
            strokeColor: segmentColors[segment.type],
            strokeWeight: 4,
            strokeOpacity: 0.8
          }}
          onClick={() => onSegmentClick?.(segment)}
        />
      ))}

      {/* Render waypoints */}
      {route.waypoints.map((waypoint, index) => (
        <Marker
          key={`waypoint-${index}`}
          position={waypoint.location}
          icon={{
            url: waypointIcons[waypoint.type],
            scaledSize: new google.maps.Size(32, 32)
          }}
          onClick={() => onWaypointClick?.(waypoint)}
        />
      ))}
    </GoogleMap>
  );
} 