import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MapView } from '../../components/shared/MapView';
import { RouteVisualization } from '../../components/route/RouteVisualization';
import type { Tributary } from '../../components/shared/MapView';

interface POI {
  id: string;
  name: string;
  type: string;
  description: string;
  position: [number, number];
  rating: number;
  photos: string[];
  bestTime?: string;
  hours?: string;
}

interface TributaryWithMetadata extends Tributary {
  metadata: {
    activityType: string;
    difficulty: string;
    duration: number;
    distance: number;
    elevation?: number;
    surface: string[];
    weather: {
      temperature: number;
      condition: string;
      wind: number;
    };
  };
  pois: POI[];
}

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

  // Simulate MCP route generation
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Sample data simulating MCP-generated route
  const mainRoute = {
    coordinates: [
      [-74.5, 40] as [number, number],
      [-74.6, 40.1] as [number, number],
      [-74.7, 40.15] as [number, number],
    ],
    color: '#2563EB', // Primary blue for main river/car route
    metadata: {
      type: 'CAR',
      distance: 15.2,
      duration: 25,
      trafficLevel: 'moderate',
      safety: 'high',
    }
  };

  const tributaries: TributaryWithMetadata[] = [
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
      color: '#10B981', // Green for nature/scenic
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
      },
      pois: [
        {
          id: 'vista-1',
          name: 'Mountain Overlook',
          type: 'scenic',
          description: 'Panoramic views of the valley',
          position: [-74.62, 40.12] as [number, number],
          rating: 4.8,
          photos: ['url-to-photo'],
          bestTime: 'sunset'
        },
        {
          id: 'waterfall',
          name: 'Hidden Waterfall',
          type: 'scenic',
          description: 'A serene 30-foot waterfall',
          position: [-74.61, 40.13] as [number, number],
          rating: 4.6,
          photos: ['url-to-photo'],
          bestTime: 'morning'
        },
      ],
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
      color: '#8B5CF6', // Purple for cultural/historic
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
      },
      pois: [
        {
          id: 'museum',
          name: 'City Museum',
          type: 'cultural',
          description: 'Local history and artifacts',
          position: [-74.71, 40.16] as [number, number],
          rating: 4.5,
          photos: ['url-to-photo'],
          hours: '9am-5pm'
        },
        {
          id: 'old-church',
          name: 'St. Mary\'s Church',
          type: 'cultural',
          description: '19th century architecture',
          position: [-74.72, 40.15] as [number, number],
          rating: 4.7,
          photos: ['url-to-photo'],
          hours: '10am-4pm'
        },
      ],
    },
  ];

  // Flatten POIs for the map with enhanced metadata
  const markers = tributaries.flatMap(tributary =>
    tributary.pois.map(poi => ({
      id: poi.id,
      position: poi.position,
      label: poi.name,
      type: poi.type,
      metadata: {
        description: poi.description,
        rating: poi.rating,
        hours: poi.hours || undefined,
        bestTime: poi.bestTime || undefined,
        photos: poi.photos,
        tributaryId: tributary.id
      }
    }))
  );

  // Simulate active users for collaboration
  const activeUsers = [
    { id: 'user1', name: 'Alice', cursor: [-74.65, 40.12] as [number, number] },
    { id: 'user2', name: 'Bob', cursor: [-74.71, 40.16] as [number, number] },
  ];

  return (
    <div className="space-y-4">
      <div className="h-[600px]">
        <MapView
          center={center}
          zoom={zoom}
          route={{
            coordinates: mainRoute.coordinates,
            color: mainRoute.color
          }}
          tributaries={tributaries}
          markers={markers}
          interactive={true}
          loading={isLoading}
          onTributaryHover={(id) => setSelectedTributaryId(id || undefined)}
          onTributaryClick={(id) => setSelectedTributaryId(id)}
          onMarkerClick={(id) => setSelectedPOIId(id)}
        />
      </div>
      
      {/* Route Information Panel */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">{routeName}</h2>
        <p className="text-gray-600 mb-4">{routeDescription}</p>
        
        {selectedTributaryId && (
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-2">
              {tributaries.find(t => t.id === selectedTributaryId)?.name}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Activity Type</p>
                <p className="font-medium">
                  {tributaries.find(t => t.id === selectedTributaryId)?.metadata.activityType}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Difficulty</p>
                <p className="font-medium">
                  {tributaries.find(t => t.id === selectedTributaryId)?.metadata.difficulty}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="font-medium">
                  {tributaries.find(t => t.id === selectedTributaryId)?.metadata.duration} min
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Distance</p>
                <p className="font-medium">
                  {tributaries.find(t => t.id === selectedTributaryId)?.metadata.distance} km
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedPOIId && (
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-2">
              {markers.find(m => m.id === selectedPOIId)?.label}
            </h3>
            <p className="text-gray-600 mb-2">
              {markers.find(m => m.id === selectedPOIId)?.metadata.description}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Rating</p>
                <p className="font-medium">
                  {markers.find(m => m.id === selectedPOIId)?.metadata.rating} ���
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Hours</p>
                <p className="font-medium">
                  {markers.find(m => m.id === selectedPOIId)?.metadata.hours}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
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
    routeDescription: 'Start planning your adventure',
    center: [-74.6, 40.1],
    zoom: 11,
  },
}; 