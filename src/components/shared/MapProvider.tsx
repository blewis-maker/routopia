import React from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';

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