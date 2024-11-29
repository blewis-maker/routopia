'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { SearchBox } from './SearchBox';
import { RoutePanel } from './RoutePanel';

// Debug token loading
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

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const locationMarker = useRef<mapboxgl.Marker | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [startLocation, setStartLocation] = useState<Location | null>(null);
  const [endLocation, setEndLocation] = useState<Location | null>(null);
  const [waypoints, setWaypoints] = useState<Location[]>([]);

  // Get user location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([longitude, latitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to Denver if location access is denied
          setUserLocation([-104.9903, 39.7392]);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;
    if (!userLocation) return;

    console.log('Initializing map...');
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: userLocation,
      zoom: 15,
      pitch: 45,
      bearing: 0
    });

    // Create custom marker element with animation
    const el = document.createElement('div');
    el.className = 'custom-marker';
    
    // Create dot element
    const dot = document.createElement('div');
    dot.className = 'marker-dot';
    el.appendChild(dot);

    // Create pulse element
    const pulse = document.createElement('div');
    pulse.className = 'marker-pulse';
    el.appendChild(pulse);

    // Add user location marker
    locationMarker.current = new mapboxgl.Marker({
      element: el,
      anchor: 'center'
    })
      .setLngLat(userLocation)
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
        center: userLocation,
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
  }, [userLocation]);

  const handleLocationSelect = (location: Location, type: 'start' | 'end' | 'waypoint') => {
    if (!mapInstance.current) return;

    mapInstance.current.flyTo({
      center: location.coordinates,
      zoom: 14,
      essential: true
    });

    switch (type) {
      case 'start':
        setStartLocation(location);
        break;
      case 'end':
        setEndLocation(location);
        break;
      case 'waypoint':
        setWaypoints([...waypoints, location]);
        break;
    }
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
      
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={() => setShowSearch(true)}
          className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-md shadow-lg"
        >
          Plan Route
        </button>
      </div>

      {showSearch && (
        <RoutePanel
          onClose={() => setShowSearch(false)}
          startLocation={startLocation}
          endLocation={endLocation}
          waypoints={waypoints}
          onStartLocationChange={(location) => handleLocationSelect(location, 'start')}
          onEndLocationChange={(location) => handleLocationSelect(location, 'end')}
          onWaypointAdd={(location) => handleLocationSelect(location, 'waypoint')}
        />
      )}
    </div>
  );
}
