import type { Meta, StoryObj } from '@storybook/react';
import { RouteSidebar } from './index';

const meta = {
  title: 'Components/RouteSidebar',
  component: RouteSidebar,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof RouteSidebar>;

export default meta;
type Story = StoryObj<typeof RouteSidebar>;

const mainRoute = {
  coordinates: [
    [-74.5, 40] as [number, number],
    [-74.6, 40.1] as [number, number],
    [-74.7, 40.15] as [number, number],
  ],
  metadata: {
    type: 'CAR',
    distance: 15.2,
    duration: 25,
    trafficLevel: 'moderate',
    safety: 'high',
  }
};

const tributaries = [
  {
    id: 'scenic-loop',
    name: 'Scenic Mountain Loop',
    type: 'scenic' as const,
    description: 'A beautiful detour through mountain vistas',
    coordinates: [
      [-74.6, 40.1] as [number, number],
      [-74.62, 40.12] as [number, number],
      [-74.61, 40.13] as [number, number],
    ],
    color: '#10B981',
    connectionPoint: [-74.6, 40.1] as [number, number],
    metadata: {
      activityType: 'HIKE',
      difficulty: 'moderate',
      duration: 45,
      distance: 2.3,
      elevation: 150,
      surface: ['trail', 'gravel'],
      weather: {
        temperature: 72,
        condition: 'sunny',
        wind: 5
      }
    }
  },
  {
    id: 'historic-district',
    name: 'Historic District Path',
    type: 'cultural' as const,
    description: 'Explore local heritage sites',
    coordinates: [
      [-74.7, 40.15] as [number, number],
      [-74.71, 40.16] as [number, number],
      [-74.72, 40.15] as [number, number],
    ],
    color: '#8B5CF6',
    connectionPoint: [-74.7, 40.15] as [number, number],
    metadata: {
      activityType: 'WALK',
      difficulty: 'easy',
      duration: 30,
      distance: 1.5,
      surface: ['paved'],
      weather: {
        temperature: 70,
        condition: 'partly_cloudy',
        wind: 3
      }
    }
  }
];

export const Default: Story = {
  args: {
    routeName: 'Mountain Valley Explorer',
    routeDescription: 'A diverse route combining scenic views, cultural sites, and outdoor activities',
    mainRoute,
    tributaries,
    onTributarySelect: (id) => console.log('Selected tributary:', id),
  },
};

export const WithSelectedTributary: Story = {
  args: {
    routeName: 'Mountain Valley Explorer',
    routeDescription: 'A diverse route combining scenic views, cultural sites, and outdoor activities',
    mainRoute,
    tributaries,
    selectedTributaryId: 'scenic-loop',
    onTributarySelect: (id) => console.log('Selected tributary:', id),
  },
}; 