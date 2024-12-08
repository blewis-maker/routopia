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

// Boulder trail system data with elevation data
const sampleRoute = {
  type: 'LineString' as const,
  coordinates: [
    [-105.2705, 40.0150, 1650], // Boulder start
    [-105.2787, 40.0076, 1750], // Chautauqua Park
    [-105.2928, 39.9997, 1900], // NCAR
    [-105.2885, 39.9878, 2100], // South Boulder Peak
  ],
  elevation: 1650,
  flowVolume: 1,
};

const sampleTributaries = [
  {
    id: 'flatirons-trail',
    type: 'LineString' as const,
    coordinates: [
      [-105.2787, 40.0076, 1750], // Branch from Chautauqua
      [-105.2819, 40.0058, 1850], // First Flatiron
      [-105.2925, 40.0033, 1950], // Royal Arch
    ],
    elevation: 1800,
    flowVolume: 0.7,
    name: 'Flatirons Trail',
    description: 'Scenic trail through the Flatirons',
  },
  {
    id: 'bear-peak',
    type: 'LineString' as const,
    coordinates: [
      [-105.2928, 39.9997, 1900], // Branch from NCAR
      [-105.2981, 39.9986, 2050], // Bear Peak Trail
      [-105.3023, 39.9972, 2200], // Bear Peak Summit
    ],
    elevation: 2200,
    flowVolume: 0.8,
    name: 'Bear Peak Trail',
    description: 'Challenging climb to Bear Peak',
  },
];

const samplePOIs = [
  {
    coordinates: [-105.2819, 40.0058] as [number, number],
    density: 0.9,
    type: 'scenic' as const,
    name: 'First Flatiron Viewpoint',
  },
  {
    coordinates: [-105.2925, 40.0033] as [number, number],
    density: 0.8,
    type: 'activity' as const,
    name: 'Royal Arch',
  },
  {
    coordinates: [-105.3023, 39.9972] as [number, number],
    density: 1.0,
    type: 'rest' as const,
    name: 'Bear Peak Summit',
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
  render: () => {
    const [selectedTributary, setSelectedTributary] = React.useState<string | null>(null);
    const [hoveredPOI, setHoveredPOI] = React.useState<string | null>(null);
    const [flowSpeed, setFlowSpeed] = React.useState(1.2);

    // Adjust flow speed based on elevation changes
    React.useEffect(() => {
      if (selectedTributary) {
        const tributary = sampleTributaries.find(t => t.id === selectedTributary);
        if (tributary) {
          // Faster flow for steeper elevation changes
          const elevationChange = tributary.elevation! - sampleRoute.elevation;
          setFlowSpeed(1.2 + Math.abs(elevationChange) / 1000);
        }
      } else {
        setFlowSpeed(1.2);
      }
    }, [selectedTributary]);

    return (
      <div className="flex h-screen bg-stone-900">
        <RouteSidebar
          mainRoute={sampleRoute}
          tributaries={sampleTributaries}
          poiClusters={samplePOIs}
          onTributarySelect={(index) => {
            const tributary = sampleTributaries[index];
            setSelectedTributary(tributary.id);
            console.log('Selected tributary:', tributary.name);
          }}
          onPoiSelect={(poi) => {
            console.log('Selected POI:', poi);
          }}
        />
        <div className="flex-1 relative">
          <MapView
            center={[-105.2705, 40.0150]}
            zoom={13}
            markers={samplePOIs.map((poi, i) => ({
              id: `poi-${i}`,
              position: poi.coordinates,
              label: poi.name,
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
            tributaries={sampleTributaries.map((trib) => ({
              id: trib.id,
              name: trib.name,
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
            onTributaryClick={(id) => {
              setSelectedTributary(id === selectedTributary ? null : id);
              console.log('Clicked tributary:', id);
            }}
            onMarkerClick={(id) => {
              setHoveredPOI(id);
              console.log('Clicked marker:', id);
            }}
          >
            <TributaryFlow
              mainRoute={sampleRoute}
              tributaries={sampleTributaries}
              poiClusters={samplePOIs}
              riverStyle="natural"
              flowIntensity={0.8}
              flowSpeed={flowSpeed}
              mainColor="#2563eb"
              tributaryColor={selectedTributary ? '#60a5fa' : '#94a3b8'}
              width={4}
              smoothness={0.6}
            />
          </MapView>
          <MapLegend
            showRiverLegend
            showTributaries
            showPOIs
          />
        </div>
      </div>
    );
  },
}; 