import type { Meta, StoryObj } from '@storybook/react';
import { RouteVisualizationComposite } from './RouteVisualizationComposite';

const meta: Meta<typeof RouteVisualizationComposite> = {
  title: 'Visualization/RouteVisualizationComposite',
  component: RouteVisualizationComposite,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof RouteVisualizationComposite>;

// Sample route data for Boulder Flatirons Trail
const flatirons = {
  id: 'route-1',
  coordinates: [
    { lat: 39.9994, lng: -105.2909, elevation: 1740 }, // Chautauqua Park
    { lat: 39.9982, lng: -105.2927, elevation: 1780 },
    { lat: 39.9971, lng: -105.2935, elevation: 1820 },
    { lat: 39.9962, lng: -105.2945, elevation: 1860 },
    { lat: 39.9954, lng: -105.2952, elevation: 1900 },
  ],
};

// Sample route data for Clear Creek Trail
const clearCreek = {
  id: 'route-2',
  coordinates: [
    { lat: 39.7527, lng: -105.2268, elevation: 1800 }, // Golden
    { lat: 39.7518, lng: -105.2156, elevation: 1820 },
    { lat: 39.7509, lng: -105.2045, elevation: 1840 },
    { lat: 39.7501, lng: -105.1934, elevation: 1860 },
    { lat: 39.7492, lng: -105.1823, elevation: 1880 },
  ],
};

export const FlatironsTrail: Story = {
  args: {
    route: flatirons,
  },
};

export const ClearCreekTrail: Story = {
  args: {
    route: clearCreek,
  },
};

export const WithError: Story = {
  args: {
    error: new Error('Failed to load route data'),
  },
}; 