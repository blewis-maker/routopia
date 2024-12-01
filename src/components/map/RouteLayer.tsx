import React, { useEffect, useRef } from 'react';
import { Map, Layer, Source, LineLayer } from 'mapbox-gl';
import { ProcessedRoute } from '@/services/routing/RouteProcessor';
import { useMap } from '@/hooks/useMap';
import { ActivityType } from '@/types/activities';

interface RouteLayerProps {
  route: ProcessedRoute;
  alternatives?: ProcessedRoute[];
  activityType: ActivityType;
  trafficData?: any;
  isInteractive?: boolean;
  onWaypointDrag?: (index: number, lngLat: [number, number]) => void;
}

const RouteLayer: React.FC<RouteLayerProps> = ({
  route,
  alternatives,
  activityType,
  trafficData,
  isInteractive,
  onWaypointDrag
}) => {
  const { map } = useMap();
  const sourceRef = useRef<string>(`route-${Math.random()}`);

  // Style configurations based on activity type
  const getRouteStyle = (isAlternative: boolean = false): LineLayer['paint'] => ({
    'line-color': isAlternative ? '#666' : getActivityColor(activityType),
    'line-width': isAlternative ? 3 : 5,
    'line-opacity': isAlternative ? 0.5 : 1,
    ...(trafficData && {
      'line-color': [
        'match',
        ['get', 'congestion'],
        'low', '#4CAF50',
        'moderate', '#FFC107',
        'heavy', '#F44336',
        getActivityColor(activityType)
      ]
    })
  });

  useEffect(() => {
    if (!map) return;

    // Add main route
    addRouteToMap(map, route, false);

    // Add alternative routes
    alternatives?.forEach(alt => addRouteToMap(map, alt, true));

    // Add interactive waypoints if enabled
    if (isInteractive) {
      addWaypoints(map, route);
    }

    return () => {
      // Cleanup
      removeRouteFromMap(map);
    };
  }, [map, route, alternatives, activityType, trafficData]);

  const addRouteToMap = (map: Map, route: ProcessedRoute, isAlternative: boolean) => {
    const sourceId = `${sourceRef.current}${isAlternative ? '-alt' : ''}`;
    const layerId = `${sourceId}-layer`;

    // Add source
    map.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {
          ...getRouteProperties(route),
          isAlternative
        },
        geometry: {
          type: 'LineString',
          coordinates: route.coordinates
        }
      }
    });

    // Add route layer
    map.addLayer({
      id: layerId,
      type: 'line',
      source: sourceId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: getRouteStyle(isAlternative)
    });

    // Add traffic data visualization if available
    if (trafficData && !isAlternative) {
      addTrafficLayer(map, route, sourceId);
    }
  };

  const addTrafficLayer = (map: Map, route: ProcessedRoute, sourceId: string) => {
    const trafficLayerId = `${sourceId}-traffic`;
    
    map.addLayer({
      id: trafficLayerId,
      type: 'line',
      source: sourceId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-width': 5,
        'line-color': [
          'match',
          ['get', 'congestion'],
          'low', '#4CAF50',
          'moderate', '#FFC107',
          'heavy', '#F44336',
          '#666'
        ],
        'line-opacity': 0.7
      }
    });
  };

  const addWaypoints = (map: Map, route: ProcessedRoute) => {
    route.coordinates.forEach((coord, index) => {
      if (index === 0 || index === route.coordinates.length - 1 || isWaypoint(index)) {
        addWaypointMarker(map, coord, index);
      }
    });
  };

  const addWaypointMarker = (map: Map, coord: [number, number], index: number) => {
    const el = document.createElement('div');
    el.className = `waypoint-marker ${getWaypointType(index)}`;
    
    const marker = new mapboxgl.Marker({
      element: el,
      draggable: isInteractive
    })
      .setLngLat(coord)
      .addTo(map);

    if (isInteractive) {
      marker.on('dragend', () => {
        const lngLat = marker.getLngLat();
        onWaypointDrag?.(index, [lngLat.lng, lngLat.lat]);
      });
    }
  };

  const removeRouteFromMap = (map: Map) => {
    const layers = map.getStyle().layers;
    layers?.forEach(layer => {
      if (layer.id.startsWith(sourceRef.current)) {
        map.removeLayer(layer.id);
      }
    });

    const sources = map.getStyle().sources;
    Object.keys(sources).forEach(source => {
      if (source.startsWith(sourceRef.current)) {
        map.removeSource(source);
      }
    });
  };

  return null; // Rendering is handled directly by Mapbox
};

// Helper functions
const getActivityColor = (type: ActivityType): string => {
  switch (type) {
    case 'car': return '#3F51B5';
    case 'bike': return '#4CAF50';
    case 'ski': return '#2196F3';
    default: return '#666';
  }
};

const getRouteProperties = (route: ProcessedRoute) => ({
  distance: route.distance,
  duration: route.duration,
  congestion: route.trafficLevel || 'low'
});

const isWaypoint = (index: number) => {
  // Logic to determine if this coordinate is a waypoint
  return false; // Implement based on your route data structure
};

const getWaypointType = (index: number): 'start' | 'end' | 'waypoint' => {
  if (index === 0) return 'start';
  // Assuming last index is end point
  return 'waypoint';
};

export default RouteLayer; 