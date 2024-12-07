import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MapView } from '../../components/shared/MapView';
import { RouteVisualization } from '../../components/route/RouteVisualization';

interface CompositeRouteViewProps {
  routeName: string;
  routeDescription?: string;
  center: [number, number];
  zoom: number;
}

const CompositeRouteView: React.FC<CompositeRouteViewProps> = ({
  routeName,
  routeDescription,
  center,
  zoom,
}) => {
  const [selectedTributaryId, setSelectedTributaryId] = React.useState<string | undefined>();
  const [selectedPOIId, setSelectedPOIId] = React.useState<string | undefined>();
  const [isLoading, setIsLoading] = React.useState(true);

  // Handle initial loading
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // Give the map style a second to load

    return () => clearTimeout(timer);
  }, []);

  // Sample data for the river-tributary metaphor
  const mainRoute = {
    coordinates: [
      [-74.5, 40],
      [-74.6, 40.1],
      [-74.7, 40.15],
    ],
    color: '#2563EB', // Primary blue for main river
  };

  const tributaries = [
    {
      id: 'scenic-loop',
      name: 'Scenic Mountain Loop',
      type: 'scenic' as const,
      description: 'A beautiful detour through mountain vistas',
      coordinates: [
        [-74.6, 40.1],  // Connects to main route
        [-74.62, 40.12],
        [-74.61, 40.13],
      ],
      color: '#10B981',
      pois: [
        {
          id: 'vista-1',
          name: 'Mountain Overlook',
          type: 'scenic',
          description: 'Panoramic views of the valley',
          position: [-74.62, 40.12] as [number, number],
        },
        {
          id: 'waterfall',
          name: 'Hidden Waterfall',
          type: 'scenic',
          description: 'A serene 30-foot waterfall',
          position: [-74.61, 40.13] as [number, number],
        },
      ],
    },
    {
      id: 'historic-district',
      name: 'Historic District Path',
      type: 'cultural' as const,
      description: 'Explore local heritage sites',
      coordinates: [
        [-74.7, 40.15], // Connects to main route
        [-74.71, 40.16],
        [-74.72, 40.15],
      ],
      color: '#8B5CF6',
      pois: [
        {
          id: 'museum',
          name: 'City Museum',
          type: 'cultural',
          description: 'Local history and artifacts',
          position: [-74.71, 40.16] as [number, number],
        },
        {
          id: 'old-church',
          name: 'St. Mary\'s Church',
          type: 'cultural',
          description: '19th century architecture',
          position: [-74.72, 40.15] as [number, number],
        },
      ],
    },
  ];

  // Flatten POIs for the map
  const markers = tributaries.flatMap(tributary =>
    tributary.pois.map(poi => ({
      id: poi.id,
      position: poi.position,
      label: poi.name,
      type: poi.type,
    }))
  );

  const handleTributarySelect = (tributaryId: string) => {
    setSelectedTributaryId(tributaryId);
    const tributary = tributaries.find(t => t.id === tributaryId);
    if (tributary) {
      // Center map on middle coordinate of tributary
      const midIndex = Math.floor(tributary.coordinates.length / 2);
      const center = tributary.coordinates[midIndex];
      // TODO: Implement map centering logic
    }
  };

  const handlePOISelect = (poiId: string) => {
    setSelectedPOIId(poiId);
    const poi = markers.find(m => m.id === poiId);
    if (poi) {
      // TODO: Implement map centering logic
    }
  };

  return (
    <div className="space-y-4">
      <div className="h-[600px]">
        <MapView
          center={center}
          zoom={zoom}
          route={mainRoute}
          tributaries={tributaries}
          markers={markers}
          interactive={true}
          loading={isLoading}
          onTributaryHover={(id) => setSelectedTributaryId(id || undefined)}
          onTributaryClick={(id) => setSelectedTributaryId(id)}
          onMarkerClick={(id) => setSelectedPOIId(id)}
        />
      </div>
      <RouteVisualization
        routeName={routeName}
        routeDescription={routeDescription}
        tributaries={tributaries}
        onTributarySelect={handleTributarySelect}
        onPOISelect={handlePOISelect}
        selectedTributaryId={selectedTributaryId}
      />
    </div>
  );
};

const meta = {
  title: 'Composite/RouteCreation',
  component: CompositeRouteView,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof CompositeRouteView>;

export default meta;
type Story = StoryObj<typeof CompositeRouteView>;

export const RiverAndTributaries: Story = {
  args: {
    routeName: 'Mountain Valley Explorer',
    routeDescription: 'A diverse route combining scenic views, cultural sites, and outdoor activities',
    center: [-74.6, 40.1],
    zoom: 11,
  },
};

export const EmptyRoute: Story = {
  args: {
    routeName: 'New Route',
    routeDescription: 'Start planning your route',
    center: [-74.6, 40.1],
    zoom: 11,
  },
}; 