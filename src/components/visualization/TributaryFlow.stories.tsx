import type { Meta, StoryObj } from '@storybook/react';
import { TributaryFlow } from './TributaryFlow';
import type { Position } from 'geojson';

// Sample route with wider spread coordinates
const mainRoute = {
  type: 'LineString' as const,
  coordinates: [
    [0, 0],
    [200, 0],
    [300, 100],
    [400, 100],
  ] as Position[],
  elevation: 100,
};

const tributaries = [
  {
    type: 'LineString' as const,
    coordinates: [
      [100, 150],  // Start point
      [195, 5],    // End point near but not exactly on main route
    ] as Position[],
    elevation: 200,
  },
  {
    type: 'LineString' as const,
    coordinates: [
      [300, 200],  // Start point
      [305, 98],   // End point near but not exactly on main route
    ] as Position[],
    elevation: 150,
  },
];

// Preview tributaries
const previewTributaries = [
  {
    type: 'LineString' as const,
    coordinates: [
      [150, -100],
      [155, 3],    // End point near main route
    ] as Position[],
  },
  {
    type: 'LineString' as const,
    coordinates: [
      [350, 150],
      [345, 102],  // End point near main route
    ] as Position[],
  },
];

// POI clusters
const poiClusters = [
  {
    coordinates: [100, 0] as [number, number],
    density: 0.8,
    type: 'scenic' as const,
  },
  {
    coordinates: [300, 100] as [number, number],
    density: 1,
    type: 'activity' as const,
  },
  {
    coordinates: [350, 100] as [number, number],
    density: 0.6,
    type: 'rest' as const,
  },
];

// Connection points
const connectionPoints = [
  {
    coordinates: [200, 0] as [number, number],
    suitability: 0.9,
    isActive: true,
  },
  {
    coordinates: [300, 100] as [number, number],
    suitability: 0.8,
  },
  {
    coordinates: [150, 0] as [number, number],
    suitability: 0.5,
  },
];

const meta: Meta<typeof TributaryFlow> = {
  title: 'Visualization/TributaryFlow',
  component: TributaryFlow,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '800px', height: '600px', background: '#000' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TributaryFlow>;

export const Default: Story = {
  args: {
    mainRoute,
    tributaries,
    flowSpeed: 1,
  },
};

export const FastFlow: Story = {
  args: {
    mainRoute,
    tributaries,
    flowSpeed: 2,
    mainColor: '#15803d', // Green
    tributaryColor: '#86efac', // Light green
  },
};

export const SingleRoute: Story = {
  args: {
    mainRoute,
    tributaries: [],
    mainColor: '#7c3aed', // Purple
    width: 6,
  },
};

export const SmoothFlow: Story = {
  args: {
    mainRoute,
    tributaries,
    flowSpeed: 1,
    smoothness: 0.7,  // Higher smoothness for more curved paths
    width: 6,
  },
};

export const WithPOIs: Story = {
  args: {
    mainRoute,
    tributaries,
    poiClusters,
    flowSpeed: 1,
    width: 4,
    onClusterClick: (cluster) => {
      console.log('Cluster clicked:', cluster);
    },
  },
};

export const WithPreview: Story = {
  args: {
    mainRoute,
    tributaries,
    previewTributaries,
    flowSpeed: 1,
    mainColor: '#2563eb',
    tributaryColor: '#60a5fa',
    previewColor: '#94a3b8',
    onPreviewClick: (index) => {
      console.log(`Preview tributary ${index} clicked`);
    },
  },
};

export const WithConnections: Story = {
  args: {
    mainRoute,
    tributaries,
    connectionPoints,
    flowSpeed: 1,
    width: 4,
    onConnectionPointClick: (point) => {
      console.log('Connection point clicked:', point);
    },
  },
};

export const TerrainBased: Story = {
  args: {
    mainRoute: {
      ...mainRoute,
      elevation: 500,  // High elevation for faster flow
    },
    tributaries: tributaries.map(t => ({
      ...t,
      elevation: t.elevation * 2,  // Increase elevation for more dramatic effect
    })),
    flowSpeed: 1,
    smoothness: 0.6,
    width: 5,
  },
};

export const FullFeatures: Story = {
  args: {
    mainRoute,
    tributaries,
    previewTributaries,
    poiClusters,
    connectionPoints,
    flowSpeed: 1,
    smoothness: 0.5,
    width: 4,
    onPreviewClick: (index) => {
      console.log(`Preview tributary ${index} clicked`);
    },
    onClusterClick: (cluster) => {
      console.log('Cluster clicked:', cluster);
    },
    onConnectionPointClick: (point) => {
      console.log('Connection point clicked:', point);
    },
  },
}; 