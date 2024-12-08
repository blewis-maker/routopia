import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { RouteDrawing } from '@/components/route/RouteDrawing';
import { RouteCollaborationDecorator } from '../decorators/RouteCollaborationDecorator';
import type { CollaborationState, Point } from '@/services/mcp/RouteCollaborationService';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Initialize Mapbox token for stories
if (process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
}

// Sample route data for stories
const sampleRouteData: CollaborationState = {
  mainRoute: {
    coordinates: [
      [-105.2705, 40.0150], // Boulder start
      [-105.2787, 40.0076], // Chautauqua Park
      [-105.2928, 39.9997], // NCAR
    ],
    metadata: {
      elevation: 1650,
      flowVolume: 1.2,
    }
  },
  tributaries: [
    {
      id: 'scenic-1',
      coordinates: [
        [-105.2787, 40.0076],
        [-105.2819, 40.0058],
      ],
      connectionPoint: [-105.2787, 40.0076],
      type: 'scenic',
      metadata: {
        name: 'Flatirons Vista',
        elevation: 1800,
        flowVolume: 0.8,
      }
    }
  ],
  activeUsers: [
    {
      id: 'user-1',
      name: 'Test User',
      cursor: [-105.2705, 40.0150],
    }
  ],
  pois: []
};

const meta = {
  title: 'Route/Drawing',
  component: RouteDrawing,
  decorators: [RouteCollaborationDecorator],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof RouteDrawing>;

export default meta;
type Story = StoryObj<typeof meta>;

// Main Route Drawing
export const MainRoute: Story = {
  args: {
    sessionId: 'demo-session',
    mode: 'main',
    initialState: sampleRouteData,
  },
};

// Tributary Mode
export const TributaryMode: Story = {
  args: {
    sessionId: 'demo-session',
    mode: 'tributary',
    selectedTributaryId: 'scenic-1',
    initialState: sampleRouteData,
  },
};

// Collaborative Session
export const CollaborativeSession: Story = {
  args: {
    sessionId: 'collab-session',
    mode: 'main',
    initialState: {
      ...sampleRouteData,
      activeUsers: [
        { id: 'user-1', name: 'Alice', cursor: [-105.2705, 40.0150] },
        { id: 'user-2', name: 'Bob', cursor: [-105.2787, 40.0076] },
      ],
    },
  },
};

// Drawing with Existing Route
export const WithExistingRoute: Story = {
  args: {
    sessionId: 'existing-route',
    mode: 'tributary',
    selectedTributaryId: 'activity-1',
    initialState: {
      ...sampleRouteData,
      tributaries: [
        ...sampleRouteData.tributaries,
        {
          id: 'activity-1',
          coordinates: [
            [-105.2928, 39.9997],
            [-105.2925, 40.0033],
          ],
          connectionPoint: [-105.2928, 39.9997],
          type: 'activity',
          metadata: {
            name: 'Royal Arch Trail',
            activityType: 'hiking',
            difficulty: 'hard',
            duration: 60,
            distance: 1.8,
          }
        },
      ],
    },
  },
}; 