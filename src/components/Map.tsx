'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
if (!token) {
  console.error('Mapbox token not found');
} else {
  console.log('Mapbox token loaded');
  mapboxgl.accessToken = token;
}

interface Location {
  coordinates: [number, number];
  address: string;
}

interface MapProps {
  startLocation: Location | null;
  endLocation: Location | null;
  waypoints: Location[];
  onLocationSelect: (location: Location, type: 'start' | 'end' | 'waypoint') => void;
}

export default function Map({ 
  startLocation, 
  endLocation, 
  waypoints, 
  onLocationSelect,
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const locationMarker = useRef<mapboxgl.Marker | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    // Default to London coordinates if no startLocation
    const defaultLocation: [number, number] = [-0.127758, 51.507351];
    
    console.log('Initializing map...');
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: startLocation?.coordinates || defaultLocation,
      zoom: 15,
      pitch: 45,
      bearing: 0
    });

    // Create a custom marker element
    const el = document.createElement('div');
    el.className = 'custom-marker';
    
    el.innerHTML = `
      <img src="/Routopia Logo.svg" alt="Location Marker" />
      <div class="marker-pulse"></div>
    `;

    // Create the marker with the custom element
    const marker = new mapboxgl.Marker({
      element: el,
      anchor: 'center'
    })
    .setLngLat(startLocation?.coordinates || defaultLocation)
    .addTo(map);

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.addControl(new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showAccuracyCircle: true,
      showUserLocation: true,
      fitBoundsOptions: {
        maxZoom: 15
      }
    }));

    // Smooth fly to user location on initial load
    map.once('load', () => {
      map.flyTo({
        center: startLocation?.coordinates || defaultLocation,
        zoom: 15,
        speed: 0.8,
        curve: 1,
        essential: true
      });
    });

    mapInstance.current = map;

    return () => {
      console.log('Cleaning up map');
      if (locationMarker.current) {
        locationMarker.current.remove();
      }
      map.remove();
      mapInstance.current = null;
    };
  }, [startLocation]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
}
