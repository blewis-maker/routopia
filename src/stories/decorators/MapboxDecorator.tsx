import React, { useEffect } from 'react';
import type { Decorator } from '@storybook/react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export const MapboxDecorator: Decorator = (Story) => {
  useEffect(() => {
    // Set Mapbox token
    if (process.env.STORYBOOK_MAPBOX_TOKEN) {
      mapboxgl.accessToken = process.env.STORYBOOK_MAPBOX_TOKEN;
    }
  }, []);

  return <Story />;
};