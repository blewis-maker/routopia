import React, { useEffect } from 'react';
import type { Preview } from '@storybook/react';
import { initialize as initializeMSW, mswLoader } from 'msw-storybook-addon';
import '../src/styles/globals.css';
import { ThemeProvider } from '../src/styles/theme/themeProvider';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Initialize MSW
initializeMSW();

// Initialize Mapbox
if (process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
}

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#0a0a0a' },
      ],
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="min-h-screen bg-white dark:bg-neutral-950">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  loaders: [mswLoader],
};

export default preview; 