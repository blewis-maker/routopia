'use client';

import React from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Tributary {
  id: string;
  name: string;
  coordinates: [number, number][];
  color?: string;
  type: 'scenic' | 'cultural' | 'activity';
  description?: string;
  connectionPoint: [number, number];
  metadata?: {
    activityType: string;
    difficulty: string;
    duration: number;
    distance: number;
    elevation?: number;
    surface: string[];
    weather?: {
      temperature: number;
      condition: string;
      wind: number;
    };
  };
}

interface POIMarker {
  id: string;
  position: [number, number];
  label: string;
  type: string;
  metadata?: {
    description?: string;
    rating?: number;
    hours?: string;
    bestTime?: string;
    photos?: string[];
    tributaryId?: string;
  };
}

interface MapViewProps {
  center: [number, number];
  zoom: number;
  markers?: POIMarker[];
  route?: {
    coordinates: [number, number][];
    color?: string;
    metadata?: {
      type: string;
      distance: number;
      duration: number;
      trafficLevel: string;
      safety: string;
    };
  };
  tributaries?: Tributary[];
  interactive?: boolean;
  loading?: boolean;
  onTributaryHover?: (tributaryId: string | null) => void;
  onTributaryClick?: (tributaryId: string) => void;
  onMarkerClick?: (markerId: string) => void;
  onRouteClick?: (point: [number, number]) => void;
  children?: React.ReactNode;
}

export type { Tributary, POIMarker };

export const MapView: React.FC<MapViewProps> = ({
  center,
  zoom,
  markers = [],
  route,
  tributaries = [],
  interactive = false,
  loading = false,
  onTributaryHover,
  onTributaryClick,
  onMarkerClick,
  onRouteClick,
  children,
}) => {
  const mapContainer = React.useRef<HTMLDivElement>(null);
  const map = React.useRef<mapboxgl.Map | null>(null);
  const markersRef = React.useRef<mapboxgl.Marker[]>([]);
  const hoveredTributaryId = React.useRef<string | null>(null);
  const [styleLoaded, setStyleLoaded] = React.useState(false);

  // Initialize map
  React.useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: center,
      zoom: zoom,
      interactive: !loading,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('style.load', () => {
      setStyleLoaded(true);
    });

    // Cleanup function
    return () => {
      // Remove all markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      
      // Remove map
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update center when it changes
  React.useEffect(() => {
    if (!map.current) return;
    map.current.setCenter(center);
  }, [center]);

  // Handle markers
  React.useEffect(() => {
    if (!map.current || !styleLoaded) return;

    // Remove existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    markers.forEach(marker => {
      const el = document.createElement('div');
      el.className = `marker marker-${marker.type}`;
      el.style.backgroundColor = getMarkerColor(marker.type);
      el.style.width = '12px';
      el.style.height = '12px';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';
      el.style.cursor = interactive ? 'pointer' : 'default';

      if (marker.label) {
        const tooltip = document.createElement('div');
        tooltip.className = 'marker-tooltip';
        tooltip.textContent = marker.label;
        el.appendChild(tooltip);
      }

      if (interactive && onMarkerClick) {
        el.addEventListener('click', () => onMarkerClick(marker.id));
      }

      const mapboxMarker = new mapboxgl.Marker(el)
        .setLngLat(marker.position)
        .addTo(map.current!);

      markersRef.current.push(mapboxMarker);
    });

    // Cleanup function
    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
    };
  }, [markers, interactive, onMarkerClick, styleLoaded]);

  // Handle main route
  React.useEffect(() => {
    if (!map.current || !route || !styleLoaded) return;

    const sourceId = 'main-route';
    const layerId = 'main-route-layer';

    // Remove existing route
    if (map.current.getSource(sourceId)) {
      map.current.removeLayer(layerId);
      map.current.removeSource(sourceId);
    }

    // Add new route
    map.current.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: route.coordinates,
        },
      },
    });

    map.current.addLayer({
      id: layerId,
      type: 'line',
      source: sourceId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': route.color || '#2563EB',
        'line-width': 6,
      },
    });

    if (interactive && onRouteClick) {
      map.current.on('click', layerId, (e) => {
        if (e.lngLat) {
          onRouteClick([e.lngLat.lng, e.lngLat.lat]);
        }
      });
    }

    return () => {
      if (map.current?.getSource(sourceId)) {
        map.current.removeLayer(layerId);
        map.current.removeSource(sourceId);
      }
    };
  }, [route, interactive, onRouteClick, styleLoaded]);

  // Handle tributaries
  React.useEffect(() => {
    if (!map.current || !styleLoaded) return;

    // Remove existing tributaries
    tributaries.forEach(tributary => {
      const sourceId = `tributary-${tributary.id}`;
      const layerId = `tributary-layer-${tributary.id}`;
      
      if (map.current!.getSource(sourceId)) {
        map.current!.removeLayer(layerId);
        map.current!.removeSource(sourceId);
      }
    });

    // Add new tributaries
    tributaries.forEach(tributary => {
      const sourceId = `tributary-${tributary.id}`;
      const layerId = `tributary-layer-${tributary.id}`;

      map.current!.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {
            id: tributary.id,
            name: tributary.name,
            type: tributary.type,
          },
          geometry: {
            type: 'LineString',
            coordinates: tributary.coordinates,
          },
        },
      });

      map.current!.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': tributary.color || getTributaryColor(tributary.type),
          'line-width': [
            'case',
            ['boolean', ['==', ['get', 'id'], hoveredTributaryId.current], false],
            6,
            4
          ],
          'line-opacity': [
            'case',
            ['boolean', ['==', ['get', 'id'], hoveredTributaryId.current], false],
            1,
            0.8
          ],
        },
      });

      if (interactive) {
        // Handle hover events
        if (onTributaryHover) {
          map.current!.on('mouseenter', layerId, () => {
            map.current!.getCanvas().style.cursor = 'pointer';
            hoveredTributaryId.current = tributary.id;
            onTributaryHover(tributary.id);
            map.current!.setPaintProperty(layerId, 'line-width', 6);
            map.current!.setPaintProperty(layerId, 'line-opacity', 1);
          });

          map.current!.on('mouseleave', layerId, () => {
            map.current!.getCanvas().style.cursor = '';
            hoveredTributaryId.current = null;
            onTributaryHover(null);
            map.current!.setPaintProperty(layerId, 'line-width', 4);
            map.current!.setPaintProperty(layerId, 'line-opacity', 0.8);
          });
        }

        // Handle click events
        if (onTributaryClick) {
          map.current!.on('click', layerId, () => {
            onTributaryClick(tributary.id);
          });
        }
      }
    });

    return () => {
      tributaries.forEach(tributary => {
        const sourceId = `tributary-${tributary.id}`;
        const layerId = `tributary-layer-${tributary.id}`;
        
        if (map.current?.getSource(sourceId)) {
          map.current.removeLayer(layerId);
          map.current.removeSource(sourceId);
        }
      });
    };
  }, [tributaries, interactive, onTributaryHover, onTributaryClick, styleLoaded]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full rounded-lg overflow-hidden" />
      {children}
      {loading && (
        <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
        </div>
      )}
    </div>
  );
};

// Utility functions for consistent colors
function getTributaryColor(type: string): string {
  switch (type) {
    case 'scenic':
      return '#10B981'; // Green
    case 'cultural':
      return '#8B5CF6'; // Purple
    case 'activity':
      return '#F59E0B'; // Orange
    default:
      return '#6B7280'; // Gray
  }
}

function getMarkerColor(type: string): string {
  return getTributaryColor(type);
} 