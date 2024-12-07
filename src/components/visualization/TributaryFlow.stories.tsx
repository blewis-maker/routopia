import type { Meta, StoryObj } from '@storybook/react';
import { TributaryFlow } from './TributaryFlow';
import type { Position } from 'geojson';

const meta: Meta<typeof TributaryFlow> = {
  title: 'Visualization/TributaryFlow',
  component: TributaryFlow,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TributaryFlow>;

// Sample route with elevation data
const mainRoute = {
  type: 'LineString' as const,
  coordinates: [
    [0, 0],
    [100, 0],
    [150, 50],
    [200, 50],
  ] as Position[],
  elevation: 100,
};

const tributaries = [
  {
    type: 'LineString' as const,
    coordinates: [
      [50, 50],
      [100, 0],
    ] as Position[],
    elevation: 200,
  },
  {
    type: 'LineString' as const,
    coordinates: [
      [150, 100],
      [150, 50],
    ] as Position[],
    elevation: 150,
  },
];

const previewTributaries: GeoJSON.LineString[] = [
  {
    type: 'LineString',
    coordinates: [
      [75, -50],
      [75, 0],
    ],
  },
  {
    type: 'LineString',
    coordinates: [
      [175, 75],
      [175, 50],
    ],
  },
];

// Sample POI clusters
const poiClusters = [
  {
    coordinates: [50, 0] as [number, number],
    density: 0.8,
    type: 'scenic' as const,
  },
  {
    coordinates: [150, 50] as [number, number],
    density: 1,
    type: 'activity' as const,
  },
  {
    coordinates: [175, 50] as [number, number],
    density: 0.6,
    type: 'rest' as const,
  },
];

// Sample connection points
const connectionPoints = [
  {
    coordinates: [100, 0] as [number, number],
    suitability: 0.9,
    isActive: true,
  },
  {
    coordinates: [150, 50] as [number, number],
    suitability: 0.8,
  },
  {
    coordinates: [75, 0] as [number, number],
    suitability: 0.5,
  },
];

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

export const WithClusters: Story = {
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

export const WithConnectionPoints: Story = {
  args: {
    mainRoute,
    tributaries,
    connectionPoints,
    flowSpeed: 1,
    width: 4,
    onConnectionPointClick: (point) => {
      console.log('Connection point clicked:', point);
    },
    onDragStart: (point) => {
      console.log('Started dragging point:', point);
    },
    onDragEnd: (point) => {
      console.log('Finished dragging point:', point);
    },
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

export const DynamicWidth: Story = {
  args: {
    mainRoute,
    tributaries: [
      ...tributaries,
      {
        type: 'LineString',
        coordinates: [
          [175, 75],
          [175, 50],
        ],
        elevation: 120,
      },
    ],
    flowSpeed: 1,
    smoothness: 0.5,
    width: 4,
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
    onDragStart: (point) => {
      console.log('Started dragging point:', point);
    },
    onDragEnd: (point) => {
      console.log('Finished dragging point:', point);
    },
  },
}; 