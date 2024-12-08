import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MapView } from '@/components/shared/MapView';
import { TributaryFlow } from '@/components/visualization/TributaryFlow';
import { MapLegend } from '@/components/map/MapLegend';
import { RouteSidebar } from '@/components/shared/RouteSidebar';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Initialize Mapbox token for stories
if (process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
}

// Sample data with realistic coordinates and metadata
const sampleRoute = {
  type: 'LineString' as const,
  coordinates: [
    [-105.2705, 40.0150], // Boulder start
    [-105.2787, 40.0076], // Chautauqua Park
    [-105.2928, 39.9997], // NCAR
    [-105.2885, 39.9878], // South Boulder Peak
  ],
  elevation: 1650,
  flowVolume: 1,
};

const sampleTributaries = [
  {
    type: 'LineString' as const,
    coordinates: [
      [-105.2787, 40.0076], // Branch from Chautauqua
      [-105.2819, 40.0058], // First Flatiron
      [-105.2925, 40.0033], // Royal Arch
    ],
    elevation: 1800,
    flowVolume: 0.7,
  },
  {
    type: 'LineString' as const,
    coordinates: [
      [-105.2928, 39.9997], // Branch from NCAR
      [-105.2981, 39.9986], // Bear Peak Trail
      [-105.3023, 39.9972], // Bear Peak Summit
    ],
    elevation: 2200,
    flowVolume: 0.8,
  },
];

const samplePOIs = [
  {
    coordinates: [-105.2819, 40.0058] as [number, number],
    density: 0.9,
    type: 'scenic' as const,
  },
  {
    coordinates: [-105.2925, 40.0033] as [number, number],
    density: 0.8,
    type: 'activity' as const,
  },
  {
    coordinates: [-105.3023, 39.9972] as [number, number],
    density: 1.0,
    type: 'rest' as const,
  },
];

const meta: Meta = {
  title: 'Composite/RouteCreation',
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
    },
  },
};

export default meta;

export const RiverRouteCreation: StoryObj = {
  render: () => (
    <div className="flex h-screen bg-stone-900">
      <RouteSidebar
        mainRoute={sampleRoute}
        tributaries={sampleTributaries}
        poiClusters={samplePOIs}
        onTributarySelect={(index) => console.log('Selected tributary:', index)}
        onPoiSelect={(poi) => console.log('Selected POI:', poi)}
      />
      <div className="flex-1 relative">
        <MapView
          center={[-105.2705, 40.0150]} // Center on Boulder
          zoom={13}
          markers={samplePOIs.map((poi, i) => ({
            id: `poi-${i}`,
            position: poi.coordinates,
            label: `POI ${i + 1}`,
            type: poi.type,
          }))}
          route={{
            coordinates: sampleRoute.coordinates as [number, number][],
            color: '#2563eb',
            metadata: {
              type: 'hiking',
              distance: 7.2,
              duration: 180,
              trafficLevel: 'low',
              safety: 'moderate',
            },
          }}
          tributaries={sampleTributaries.map((trib, i) => ({
            id: `trib-${i}`,
            name: `Tributary ${i + 1}`,
            coordinates: trib.coordinates as [number, number][],
            type: 'scenic',
            connectionPoint: trib.coordinates[0] as [number, number],
            metadata: {
              activityType: 'hiking',
              difficulty: 'moderate',
              duration: 60,
              distance: 2.4,
              elevation: trib.elevation,
              surface: ['trail', 'rock'],
            },
          }))}
          interactive={true}
          onTributaryClick={(id) => console.log('Clicked tributary:', id)}
          onMarkerClick={(id) => console.log('Clicked marker:', id)}
        >
          <TributaryFlow
            mainRoute={sampleRoute}
            tributaries={sampleTributaries}
            poiClusters={samplePOIs}
            riverStyle="natural"
            flowIntensity={0.8}
            mainColor="#2563eb"
            tributaryColor="#60a5fa"
            width={4}
            smoothness={0.5}
          />
        </MapView>
        <MapLegend
          showRiverLegend
          showTributaries
          showPOIs
        />
      </div>
    </div>
  ),
}; 