import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { RouteSidebar } from '../../components/shared/RouteSidebar';

const meta = {
  title: 'Route/RouteSidebar',
  component: RouteSidebar,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof RouteSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockMainRoute = {
  type: 'LineString' as const,
  coordinates: [
    [-105.2705, 40.0150],
    [-105.2787, 40.0076],
  ],
  elevation: 1650,
  flowVolume: 1.2,
};

const mockTributaries = [
  {
    type: 'LineString' as const,
    coordinates: [
      [-105.2787, 40.0076],
      [-105.2819, 40.0058],
    ],
    elevation: 1800,
    flowVolume: 0.8,
  },
];

const mockPOIClusters = [
  {
    coordinates: [-105.2819, 40.0058] as [number, number],
    density: 0.9,
    type: 'scenic' as const,
    name: 'Flatiron View',
    description: 'Beautiful view of the Flatirons',
  },
  {
    coordinates: [-105.2705, 40.0150] as [number, number],
    density: 0.7,
    type: 'activity' as const,
    name: 'Trail Junction',
    description: 'Major trail intersection with rest area',
  },
];

export const Default: Story = {
  args: {
    mainRoute: mockMainRoute,
    tributaries: mockTributaries,
    poiClusters: mockPOIClusters,
  },
};

export const WithSelectedTributary: Story = {
  args: {
    mainRoute: mockMainRoute,
    tributaries: mockTributaries,
    poiClusters: mockPOIClusters,
    onTributarySelect: (index) => console.log('Selected tributary:', index),
    onPoiSelect: (poi) => console.log('Selected POI:', poi),
  },
}; 