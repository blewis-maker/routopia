import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MapView } from '@/components/shared/MapView';
import { TributaryFlow } from '@/components/visualization/TributaryFlow';
import { MapLegend } from '@/components/map/MapLegend';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Initialize Mapbox token for stories
if (process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
}

// Sample route data for different states
const newRouteData = {
  type: 'LineString' as const,
  coordinates: [] as [number, number][],
};

const inProgressRouteData = {
  type: 'LineString' as const,
  coordinates: [
    [-105.2705, 40.0150], // Start point
    [-105.2787, 40.0076], // Midpoint
  ] as [number, number][],
};

const completeRouteData = {
  type: 'LineString' as const,
  coordinates: [
    [-105.2705, 40.0150], // Start
    [-105.2787, 40.0076], // Mid 1
    [-105.2928, 39.9997], // Mid 2
    [-105.2885, 39.9878], // End
  ] as [number, number][],
};

const optimizedRouteData = {
  ...completeRouteData,
  metadata: {
    optimizationScore: 0.92,
    elevationGain: 450,
    distance: 7.2,
    estimatedTime: 180,
  },
};

const meta: Meta = {
  title: 'Route/RouteStates',
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
    },
  },
};

export default meta;

// Story for New Route state
export const NewRoute: StoryObj = {
  render: () => (
    <div className="h-screen bg-stone-900">
      <MapView
        center={[-105.2705, 40.0150]}
        zoom={13}
        route={{
          coordinates: newRouteData.coordinates,
          color: '#2563eb',
        }}
        interactive={true}
      />
    </div>
  ),
};

// Story for Route In Progress
export const RouteInProgress: StoryObj = {
  render: () => (
    <div className="h-screen bg-stone-900">
      <MapView
        center={[-105.2705, 40.0150]}
        zoom={13}
        route={{
          coordinates: inProgressRouteData.coordinates,
          color: '#2563eb',
          metadata: {
            type: 'hiking',
            distance: 2.1,
            duration: 45,
            trafficLevel: 'low',
            safety: 'good',
          },
        }}
        interactive={true}
      >
        <TributaryFlow
          mainRoute={inProgressRouteData}
          riverStyle="natural"
          flowIntensity={0.8}
          mainColor="#2563eb"
          width={4}
          smoothness={0.5}
        />
      </MapView>
    </div>
  ),
};

// Story for Complete Route
export const RouteComplete: StoryObj = {
  render: () => (
    <div className="h-screen bg-stone-900">
      <MapView
        center={[-105.2705, 40.0150]}
        zoom={13}
        route={{
          coordinates: completeRouteData.coordinates,
          color: '#2563eb',
          metadata: {
            type: 'hiking',
            distance: 7.2,
            duration: 180,
            trafficLevel: 'low',
            safety: 'moderate',
          },
        }}
        interactive={true}
      >
        <TributaryFlow
          mainRoute={completeRouteData}
          riverStyle="natural"
          flowIntensity={0.8}
          mainColor="#2563eb"
          width={4}
          smoothness={0.5}
        />
        <MapLegend
          showRiverLegend
          showPOIs
        />
      </MapView>
    </div>
  ),
};

// Story for Optimized Route
export const RouteOptimized: StoryObj = {
  render: () => (
    <div className="h-screen bg-stone-900">
      <MapView
        center={[-105.2705, 40.0150]}
        zoom={13}
        route={{
          coordinates: optimizedRouteData.coordinates,
          color: '#10b981', // Green color for optimized route
          metadata: {
            type: 'hiking',
            distance: optimizedRouteData.metadata.distance,
            duration: optimizedRouteData.metadata.estimatedTime,
            trafficLevel: 'low',
            safety: 'excellent',
          },
        }}
        interactive={true}
      >
        <TributaryFlow
          mainRoute={optimizedRouteData}
          riverStyle="natural"
          flowIntensity={0.9} // Higher flow intensity for optimized route
          mainColor="#10b981"
          width={4}
          smoothness={0.6}
        />
        <MapLegend
          showRiverLegend
          showPOIs
          showOptimizationScore={optimizedRouteData.metadata.optimizationScore}
        />
      </MapView>
    </div>
  ),
}; 