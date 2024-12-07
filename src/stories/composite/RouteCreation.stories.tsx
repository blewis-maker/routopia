import type { Meta, StoryObj } from '@storybook/react';
import { MainApplicationView } from '@/components/app/MainApplicationView';
import { MapView } from '@/components/shared/MapView';
import { RouteCreator } from '@/components/route/RouteCreator';
import { RoutePreferences } from '@/components/route/RoutePreferences';

const meta = {
  title: 'Flows/RouteCreation',
  component: MainApplicationView,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Route creation process with various states and interactions.',
      },
    },
  },
} satisfies Meta<typeof MainApplicationView>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample route data at different stages
const emptyRoute = {
  id: 'new',
  name: '',
  type: 'hiking',
  coordinates: [],
};

const inProgressRoute = {
  id: 'in-progress',
  name: 'Mountain Trail',
  type: 'hiking',
  coordinates: [
    { lat: 40.0219, lng: -105.3046, elevation: 1740 },
    { lat: 40.0225, lng: -105.3052, elevation: 1780 },
  ],
};

const completedRoute = {
  id: 'completed',
  name: 'Boulder Flatirons Loop',
  type: 'hiking',
  coordinates: [
    { lat: 40.0219, lng: -105.3046, elevation: 1740 },
    { lat: 40.0225, lng: -105.3052, elevation: 1780 },
    { lat: 40.0231, lng: -105.3058, elevation: 1820 },
    { lat: 40.0237, lng: -105.3064, elevation: 1860 },
    { lat: 40.0243, lng: -105.3070, elevation: 1900 },
  ],
  distance: 5.2,
  elevation: 450,
  duration: 180,
};

export const NewRoute: Story = {
  args: {
    route: emptyRoute,
    mode: 'create',
    showPreferences: true,
    preferences: {
      difficulty: 'moderate',
      maxDistance: 10,
      maxElevation: 500,
      avoidHighways: true,
      preferScenic: true,
    },
  },
};

export const RouteInProgress: Story = {
  args: {
    route: inProgressRoute,
    mode: 'create',
    showPreferences: true,
    drawingEnabled: true,
    suggestions: [
      {
        id: 'suggestion-1',
        name: 'Summit Path',
        coordinates: [
          { lat: 40.0231, lng: -105.3058, elevation: 1820 },
          { lat: 40.0237, lng: -105.3064, elevation: 1860 },
        ],
      },
    ],
  },
};

export const RouteCompletion: Story = {
  args: {
    route: completedRoute,
    mode: 'review',
    showStats: true,
    stats: {
      distance: 5.2,
      elevation: 450,
      duration: 180,
      difficulty: 'moderate',
      terrain: 'mixed',
    },
  },
};

export const AIAssisted: Story = {
  args: {
    route: inProgressRoute,
    mode: 'ai-assist',
    aiSuggestions: [
      {
        id: 'ai-1',
        description: 'Continue to the summit for best views',
        coordinates: [
          { lat: 40.0231, lng: -105.3058, elevation: 1820 },
          { lat: 40.0237, lng: -105.3064, elevation: 1860 },
        ],
      },
      {
        id: 'ai-2',
        description: 'Alternative path with gentler elevation gain',
        coordinates: [
          { lat: 40.0228, lng: -105.3055, elevation: 1800 },
          { lat: 40.0234, lng: -105.3061, elevation: 1830 },
        ],
      },
    ],
  },
};

export const RouteOptimization: Story = {
  args: {
    route: completedRoute,
    mode: 'optimize',
    optimizationCriteria: {
      elevation: 'minimize',
      distance: 'balance',
      scenery: 'maximize',
    },
    alternativeRoutes: [
      {
        id: 'alt-1',
        name: 'Scenic Route',
        coordinates: [...completedRoute.coordinates],
        stats: {
          distance: 5.5,
          elevation: 480,
          duration: 190,
          sceneryScore: 8.5,
        },
      },
      {
        id: 'alt-2',
        name: 'Quick Route',
        coordinates: [...completedRoute.coordinates],
        stats: {
          distance: 4.8,
          elevation: 400,
          duration: 160,
          sceneryScore: 6.5,
        },
      },
    ],
  },
}; 