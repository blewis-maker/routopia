import { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { MapPin } from 'lucide-react';

interface POI {
  id: string;
  coordinates: [number, number];
  title: string;
  type: 'start' | 'waypoint' | 'end';
}

export function LocationMarkers({ map }: { map: mapboxgl.Map | null }) {
  const [markers, setMarkers] = useState<mapboxgl.Marker[]>([]);

  const points: POI[] = [
    { id: 'start', coordinates: [-74.5, 40], title: 'Start Point', type: 'start' },
    { id: 'end', coordinates: [-74.35, 40.06], title: 'End Point', type: 'end' }
  ];

  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markers.forEach(marker => marker.remove());

    // Add new markers
    const newMarkers = points.map(point => {
      const el = document.createElement('div');
      el.className = 'marker-container';
      
      const markerHtml = `
        <div class="
          relative p-2
          animate-bounce-subtle
          ${point.type === 'start' ? 'text-emerald-400' : 'text-teal-400'}
        ">
          <div class="marker-pulse"></div>
          <MapPin className="h-6 w-6" />
        </div>
      `;
      
      el.innerHTML = markerHtml;

      return new mapboxgl.Marker(el)
        .setLngLat(point.coordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`<h3>${point.title}</h3>`)
        )
        .addTo(map);
    });

    setMarkers(newMarkers);

    return () => {
      newMarkers.forEach(marker => marker.remove());
    };
  }, [map]);

  return null;
} 