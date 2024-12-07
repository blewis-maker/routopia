import type { Meta, StoryObj } from '@storybook/react';
import { RouteVisualization } from './RouteVisualization';

const meta = {
  title: 'Components/Route/RouteVisualization',
  component: RouteVisualization,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof RouteVisualization>;

export default meta;
type Story = StoryObj<typeof RouteVisualization>;

const sampleTributaries = [
  {
    id: 'scenic-loop',
    name: 'Scenic Mountain Loop',
    type: 'scenic' as const,
    description: 'A beautiful detour through mountain vistas',
    pois: [
      {
        id: 'vista-1',
        name: 'Mountain Overlook',
        type: 'scenic',
        description: 'Panoramic views of the valley',
      },
      {
        id: 'waterfall',
        name: 'Hidden Waterfall',
        type: 'scenic',
        description: 'A serene 30-foot waterfall',
      },
    ],
  },
  {
    id: 'historic-district',
    name: 'Historic District Path',
    type: 'cultural' as const,
    description: 'Explore local heritage sites',
    pois: [
      {
        id: 'museum',
        name: 'City Museum',
        type: 'cultural',
        description: 'Local history and artifacts',
      },
      {
        id: 'old-church',
        name: 'St. Mary\'s Church',
        type: 'cultural',
        description: '19th century architecture',
      },
    ],
  },
  {
    id: 'activity-zone',
    name: 'Adventure Sports Zone',
    type: 'activity' as const,
    description: 'Various outdoor activities and sports',
    pois: [
      {
        id: 'climbing',
        name: 'Rock Climbing Wall',
        type: 'activity',
        description: 'Beginner to advanced routes',
      },
      {
        id: 'kayak',
        name: 'Kayak Launch Point',
        type: 'activity',
        description: 'Rental equipment available',
      },
    ],
  },
];

export const Default: Story = {
  args: {
    routeName: 'Mountain Valley Explorer',
    routeDescription: 'A diverse route combining scenic views, cultural sites, and outdoor activities',
    tributaries: sampleTributaries,
    onTributarySelect: (id) => console.log('Selected tributary:', id),
    onPOISelect: (id) => console.log('Selected POI:', id),
  },
};

export const WithSelectedTributary: Story = {
  args: {
    ...Default.args,
    selectedTributaryId: 'scenic-loop',
  },
};

export const Empty: Story = {
  args: {
    routeName: 'New Route',
    routeDescription: 'Start planning your route',
    tributaries: [],
    onTributarySelect: (id) => console.log('Selected tributary:', id),
    onPOISelect: (id) => console.log('Selected POI:', id),
  },
}; 