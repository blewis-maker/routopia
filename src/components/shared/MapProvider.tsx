import React from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// This is a public token, it's okay to expose it
mapboxgl.accessToken = 'pk.eyJ1Ijoicm91dG9waWEiLCJhIjoiY2xyNXVvOWF1MDBiMjJpcWRsMnB4ZHV2eiJ9.VuD9wQwYI9wqXOZRHrqJFA';

interface MapProviderProps {
  children: React.ReactNode;
}

export const MapProvider: React.FC<MapProviderProps> = ({ children }) => {
  return (
    <div className="relative">
      {children}
      <link
        href="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css"
        rel="stylesheet"
      />
    </div>
  );
};

export default MapProvider; 