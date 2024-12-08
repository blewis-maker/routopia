import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { RouteVisualization } from '@/components/route/RouteVisualization';
import type { RouteSegment, Tributary, POI } from '@/types/route.types';

const sampleMainRoute: RouteSegment = {
  type: 'LineString',
  coordinates: [
    [-105.2705, 40.0150, 1650], // Boulder start
    [-105.2787, 40.0076, 1750], // Chautauqua Park
    [-105.2928, 39.9997, 1900], // NCAR
    [-105.2885, 39.9878, 2100], // South Boulder Peak
  ],
  elevation: 450,
  flowVolume: 1,
};

const samplePOIs: POI[] = [
  {
    id: 'poi-1',
    name: 'First Flatiron Viewpoint',
    type: 'scenic',
    description: 'Stunning views of the Flatirons',
  },
  {
    id: 'poi-2',
    name: 'Royal Arch',
    type: 'activity',
    description: 'Challenging rock formation with great photo opportunities',
  },
];

const sampleTributaries: Tributary[] = [
  {
    id: 'tributary-1',
    name: 'Scenic Flatirons Route',
    type: 'scenic',
    coordinates: [
      [-105.2705, 40.0150, 1650],
      [-105.2800, 40.0100, 1800],
      [-105.2885, 39.9878, 2100],
    ],
    elevation: 500,
    flowVolume: 0.8,
    pois: [samplePOIs[0]],
    description: 'A scenic route through the Flatirons',
  },
  {
    id: 'tributary-2',
    name: 'Royal Arch Trail',
    type: 'activity',
    coordinates: [
      [-105.2705, 40.0150, 1650],
      [-105.2850, 40.0000, 1900],
      [-105.2885, 39.9878, 2100],
    ],
    elevation: 400,
    flowVolume: 0.7,
    pois: [samplePOIs[1]],
    description: 'Trail leading to the Royal Arch formation',
  },
];

const samplePOIClusters = [
  {
    coordinates: [-105.2819, 40.0058] as [number, number],
    density: 0.9,
    type: 'scenic' as const,
    name: 'First Flatiron Viewpoint',
  },
  {
    coordinates: [-105.2925, 40.0033] as [number, number],
    density: 0.8,
    type: 'activity' as const,
    name: 'Royal Arch',
  },
];

const meta: Meta<typeof RouteVisualization> = {
  title: 'Route/Visualization',
  component: RouteVisualization,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
    },
  },
};

export default meta;
type Story = StoryObj<typeof RouteVisualization>;

// Basic Route Visualization
export const Default: Story = {
  args: {
    routeName: 'Boulder Mountain Trail',
    routeDescription: 'A scenic trail through the Flatirons',
    mainRoute: sampleMainRoute,
    tributaries: [],
    poiClusters: [],
    onTributarySelect: (tributaryId) => console.log('Selected tributary:', tributaryId),
    onPOISelect: (poiId) => console.log('Selected POI:', poiId),
  },
};

// With POIs
export const WithPOIs: Story = {
  args: {
    routeName: 'Boulder Mountain Trail',
    routeDescription: 'A scenic trail through the Flatirons',
    mainRoute: sampleMainRoute,
    tributaries: [],
    poiClusters: samplePOIClusters,
    onTributarySelect: (tributaryId) => console.log('Selected tributary:', tributaryId),
    onPOISelect: (poiId) => console.log('Selected POI:', poiId),
  },
};

// With Tributaries
export const WithTributaries: Story = {
  args: {
    routeName: 'Boulder Mountain Trail',
    routeDescription: 'A scenic trail through the Flatirons',
    mainRoute: sampleMainRoute,
    tributaries: sampleTributaries,
    poiClusters: samplePOIClusters,
    onTributarySelect: (tributaryId) => console.log('Selected tributary:', tributaryId),
    onPOISelect: (poiId) => console.log('Selected POI:', poiId),
    selectedTributaryId: 'tributary-1',
  },
};

// Full Features
export const FullFeatures: Story = {
  args: {
    routeName: 'Boulder Mountain Trail',
    routeDescription: 'A scenic trail through the Flatirons with multiple activity options',
    mainRoute: sampleMainRoute,
    tributaries: sampleTributaries,
    poiClusters: samplePOIClusters,
    onTributarySelect: (tributaryId) => console.log('Selected tributary:', tributaryId),
    onPOISelect: (poiId) => console.log('Selected POI:', poiId),
    selectedTributaryId: 'tributary-1',
  },
}; 