'use client';

import React from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapViewProps {
  center: [number, number];
  zoom: number;
  markers?: Array<{
    id: string;
    position: [number, number];
    label?: string;
  }>;
  route?: {
    coordinates: [number, number][];
    color?: string;
  };
}

export const MapView: React.FC<MapViewProps> = ({
  center,
  zoom,
  markers = [],
  route,
}) => {
  const mapContainer = React.useRef<HTMLDivElement>(null);
  const map = React.useRef<mapboxgl.Map | null>(null);

  React.useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: center,
      zoom: zoom,
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  React.useEffect(() => {
    if (!map.current) return;
    map.current.setCenter(center);
  }, [center]);

  React.useEffect(() => {
    if (!map.current) return;
    
    // Remove existing markers
    const existingMarkers = document.getElementsByClassName('mapboxgl-marker');
    Array.from(existingMarkers).forEach(marker => marker.remove());

    // Add new markers
    markers.forEach(marker => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundColor = '#10B981';
      el.style.width = '12px';
      el.style.height = '12px';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';

      if (marker.label) {
        const tooltip = document.createElement('div');
        tooltip.className = 'marker-tooltip';
        tooltip.textContent = marker.label;
        el.appendChild(tooltip);
      }

      new mapboxgl.Marker(el)
        .setLngLat(marker.position)
        .addTo(map.current!);
    });
  }, [markers]);

  React.useEffect(() => {
    if (!map.current || !route) return;

    const sourceId = 'route';
    const layerId = 'route-layer';

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
        'line-color': route.color || '#10B981',
        'line-width': 4,
      },
    });
  }, [route]);

  return (
    <div ref={mapContainer} className="w-full h-full rounded-lg overflow-hidden" />
  );
}; 