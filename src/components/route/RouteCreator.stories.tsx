import type { Meta, StoryObj } from '@storybook/react';
import { RouteCreator } from './RouteCreator';
import { MCPClientProvider } from '@/context/mcp/MCPClientContext';

const meta = {
  title: 'Route/RouteCreator',
  component: RouteCreator,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <MCPClientProvider>
        <Story />
      </MCPClientProvider>
    ),
  ],
} satisfies Meta<typeof RouteCreator>;

export default meta;
type Story = StoryObj<typeof RouteCreator>;

export const Default: Story = {
  args: {
    sessionId: 'test-session',
  },
};

export const WithCollaboration: Story = {
  args: {
    sessionId: 'collab-session',
  },
  parameters: {
    mockData: {
      activeUsers: [
        { id: 'user1', name: 'Alice', cursor: [-74.65, 40.12] },
        { id: 'user2', name: 'Bob', cursor: [-74.71, 40.16] },
      ],
      mainRoute: {
        coordinates: [
          [-74.5, 40],
          [-74.6, 40.1],
          [-74.7, 40.15],
        ],
        metadata: {
          type: 'CAR',
          distance: 15.2,
          duration: 25,
          trafficLevel: 'moderate',
          safety: 'high',
        },
      },
      tributaries: [
        {
          id: 'scenic-loop',
          name: 'Scenic Mountain Loop',
          type: 'scenic',
          description: 'A beautiful detour through mountain vistas',
          coordinates: [
            [-74.6, 40.1],
            [-74.62, 40.12],
            [-74.61, 40.13],
          ],
          color: '#10B981',
          connectionPoint: [-74.6, 40.1],
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
              wind: 5,
            },
          },
        },
      ],
      pois: [
        {
          id: 'vista-1',
          position: [-74.62, 40.12],
          metadata: {
            name: 'Mountain Overlook',
            type: 'scenic',
            description: 'Panoramic views of the valley',
            rating: 4.8,
            bestTime: 'sunset',
            photos: ['url-to-photo'],
          },
        },
      ],
    },
  },
}; 