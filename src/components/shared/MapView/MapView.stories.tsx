import type { Meta, StoryObj } from '@storybook/react'
import { MapView } from './index'
import type { Tributary, POIMarker } from './index'

const meta = {
  title: 'Components/MapView',
  component: MapView,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof MapView>

export default meta
type Story = StoryObj<typeof MapView>

// Sample data demonstrating river-tributary metaphor
const mainRoute = {
  coordinates: [
    [-74.5, 40] as [number, number],
    [-74.6, 40.1] as [number, number],
    [-74.7, 40.15] as [number, number],
  ],
  color: '#2563EB', // Primary blue for main river
  metadata: {
    type: 'CAR',
    distance: 15.2,
    duration: 25,
    trafficLevel: 'moderate',
    safety: 'high',
  }
}

const tributaries: Tributary[] = [
  {
    id: 'scenic-loop',
    name: 'Scenic Mountain Loop',
    type: 'scenic',
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
    }
  },
  {
    id: 'historic-district',
    name: 'Historic District Path',
    type: 'cultural',
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
    }
  }
]

const markers: POIMarker[] = [
  {
    id: 'vista-1',
    position: [-74.62, 40.12] as [number, number],
    label: 'Mountain Overlook',
    type: 'scenic',
    metadata: {
      description: 'Panoramic views of the valley',
      rating: 4.8,
      bestTime: 'sunset',
      photos: ['url-to-photo'],
      tributaryId: 'scenic-loop'
    }
  },
  {
    id: 'museum',
    position: [-74.71, 40.16] as [number, number],
    label: 'City Museum',
    type: 'cultural',
    metadata: {
      description: 'Local history and artifacts',
      rating: 4.5,
      hours: '9am-5pm',
      photos: ['url-to-photo'],
      tributaryId: 'historic-district'
    }
  }
]

export const Default: Story = {
  args: {
    center: [-74.6, 40.1],
    zoom: 11,
  },
}

export const MainRouteOnly: Story = {
  args: {
    center: [-74.6, 40.1],
    zoom: 11,
    route: {
      coordinates: mainRoute.coordinates,
      color: mainRoute.color,
      metadata: mainRoute.metadata
    },
  },
}

export const WithTributaries: Story = {
  args: {
    center: [-74.6, 40.1],
    zoom: 11,
    route: {
      coordinates: mainRoute.coordinates,
      color: mainRoute.color,
      metadata: mainRoute.metadata
    },
    tributaries,
    onTributaryHover: (tributaryId) => console.log('Tributary hover:', tributaryId),
    onTributaryClick: (tributaryId) => console.log('Tributary clicked:', tributaryId),
  },
}

export const WithPOIs: Story = {
  args: {
    center: [-74.6, 40.1],
    zoom: 11,
    route: {
      coordinates: mainRoute.coordinates,
      color: mainRoute.color,
      metadata: mainRoute.metadata
    },
    tributaries,
    markers,
    onMarkerClick: (markerId) => console.log('Marker clicked:', markerId),
  },
}

export const InteractiveRoute: Story = {
  args: {
    center: [-74.6, 40.1],
    zoom: 11,
    route: {
      coordinates: mainRoute.coordinates,
      color: mainRoute.color,
      metadata: mainRoute.metadata
    },
    tributaries,
    markers,
    interactive: true,
    onTributaryHover: (tributaryId) => console.log('Tributary hover:', tributaryId),
    onTributaryClick: (tributaryId) => console.log('Tributary clicked:', tributaryId),
    onMarkerClick: (markerId) => console.log('Marker clicked:', markerId),
    onRouteClick: (point) => console.log('Route clicked:', point),
  },
}

export const LoadingState: Story = {
  args: {
    center: [-74.6, 40.1],
    zoom: 11,
    loading: true,
  },
} 