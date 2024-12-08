import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { RouteCreator } from '@/components/route/RouteCreator';
import { MCPClientProvider } from '@/context/mcp/MCPClientContext';
import { MCPClient } from '@/services/mcp/MCPClient';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Initialize Mapbox token for stories
if (process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
}
// Mock MCP client for stories
// Sample route data
const sampleRouteData = {
  mainRoute: {
    coordinates: [
      [-105.2705, 40.0150], // Boulder start
      [-105.2787, 40.0076], // Chautauqua Park
      [-105.2928, 39.9997], // NCAR
    ],
    metadata: {
      type: 'hiking',
      distance: 5.2,
      duration: 120,
      trafficLevel: 'low',
      safety: 'good',
    },
  },
  tributaries: [
    {
      id: 'scenic-1',
      name: 'Flatirons Vista',
      coordinates: [
        [-105.2787, 40.0076],
        [-105.2819, 40.0058],
      ],
      type: 'scenic',
      connectionPoint: [-105.2787, 40.0076],
      metadata: {
        activityType: 'hiking',
        difficulty: 'moderate',
        duration: 45,
        distance: 1.2,
      },
    },
  ],
  pois: [
    {
      id: 'poi-1',
      position: [-105.2819, 40.0058],
      metadata: {
        name: 'Flatiron View',
        type: 'scenic',
      },
    },
  ],
  activeUsers: [
    {
      id: 'user-1',
      name: 'Test User',
      cursor: [-105.2705, 40.0150],
    },
  ],
};

// Enhanced mock MCP client for stories
const mockMCPClient = {
  connect: () => Promise.resolve(),
  disconnect: () => Promise.resolve(),
  subscribe: (sessionId: string, callback: (data: any) => void) => {
    callback(sampleRouteData);
    return Promise.resolve();
  },
  unsubscribe: () => Promise.resolve(),
  updateRoute: () => Promise.resolve(),
  updateCursor: () => Promise.resolve(),
  getInitialState: () => Promise.resolve(sampleRouteData),
  // Add event handling methods
  on: (event: string, callback: Function) => {
    console.log(`Mock: Registered handler for ${event}`);
    return () => console.log(`Mock: Unregistered handler for ${event}`);
  },
  off: (event: string, callback: Function) => {
    console.log(`Mock: Removed handler for ${event}`);
  },
  emit: (event: string, ...args: any[]) => {
    console.log(`Mock: Emitted ${event}`, args);
  }
} as unknown as MCPClient;

// Create a wrapper component for stories
const StoryWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <MCPClientProvider client={mockMCPClient}>
      <div className="h-screen bg-stone-900">
        {children}
      </div>
    </MCPClientProvider>
  );
};

const meta: Meta<typeof RouteCreator> = {
  title: 'Route/Creator',
  component: RouteCreator,
  decorators: [
    (Story) => (
      <StoryWrapper>
        <Story />
      </StoryWrapper>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
    },
  },
};

export default meta;
type Story = StoryObj<typeof RouteCreator>;

// New Route Creation
export const NewRoute: Story = {
  args: {
    sessionId: 'new-route',
  },
  parameters: {
    docs: {
      description: {
        story: 'Start creating a new route from scratch. The interface provides tools for drawing the main route and adding tributaries.',
      },
    },
  },
};

// Route with Tributaries
export const WithTributaries: Story = {
  args: {
    sessionId: 'route-with-tributaries',
    initialState: {
      ...sampleRouteData,
      tributaries: [
        ...sampleRouteData.tributaries,
        {
          id: 'activity-1',
          name: 'Royal Arch Trail',
          coordinates: [
            [-105.2928, 39.9997],
            [-105.2925, 40.0033],
          ],
          type: 'activity',
          connectionPoint: [-105.2928, 39.9997],
          metadata: {
            activityType: 'hiking',
            difficulty: 'hard',
            duration: 60,
            distance: 1.8,
          },
        },
      ],
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'A route with multiple tributaries showing different activity types and points of interest.',
      },
    },
  },
};

// Collaborative Session
export const CollaborativeSession: Story = {
  args: {
    sessionId: 'collaborative-session',
    initialState: {
      ...sampleRouteData,
      activeUsers: [
        { id: 'user-1', name: 'Alice', cursor: [-105.2705, 40.0150] },
        { id: 'user-2', name: 'Bob', cursor: [-105.2787, 40.0076] },
      ],
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Multiple users can work together to plan a route. Shows real-time cursor positions and updates.',
      },
    },
  },
};

// Route Optimization
export const RouteOptimization: Story = {
  args: {
    sessionId: 'optimization-demo',
    initialState: {
      ...sampleRouteData,
      mainRoute: {
        ...sampleRouteData.mainRoute,
        metadata: {
          ...sampleRouteData.mainRoute.metadata,
          optimizationScore: 0.92,
          elevationGain: 450,
        },
      },
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates route optimization features including traffic avoidance and elevation optimization.',
      },
    },
  },
};