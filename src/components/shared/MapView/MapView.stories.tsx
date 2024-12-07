import type { Meta, StoryObj } from '@storybook/react'
import { MapView } from './index'

const meta = {
  title: 'Components/MapView',
  component: MapView,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof MapView>

export default meta
type Story = StoryObj<typeof MapView>

// Sample data for river-tributary metaphor
const mainRoute = {
  coordinates: [
    [-74.5, 40],
    [-74.6, 40.1],
    [-74.7, 40.15],
  ],
  color: '#2563EB', // Primary blue for main river
}

const tributaries = [
  {
    id: 'tributary-1',
    name: 'Scenic Viewpoint Loop',
    coordinates: [
      [-74.6, 40.1],  // Connects to main route
      [-74.62, 40.12],
      [-74.61, 40.13],
    ],
    color: '#10B981', // Green for nature/scenic tributaries
    type: 'scenic',
  },
  {
    id: 'tributary-2',
    name: 'Historic District Path',
    coordinates: [
      [-74.7, 40.15], // Connects to main route
      [-74.71, 40.16],
      [-74.72, 40.15],
    ],
    color: '#8B5CF6', // Purple for cultural/historic tributaries
    type: 'cultural',
  },
]

const poiMarkers = [
  {
    id: 'poi-1',
    position: [-74.62, 40.12],
    label: 'Mountain Vista',
    type: 'scenic',
  },
  {
    id: 'poi-2',
    position: [-74.71, 40.16],
    label: 'Historic Museum',
    type: 'cultural',
  },
]

export const Default: Story = {
  args: {
    center: [-74.5, 40],
    zoom: 12,
  },
}

export const MainRouteOnly: Story = {
  args: {
    center: [-74.6, 40.1],
    zoom: 11,
    route: mainRoute,
  },
}

export const WithTributaries: Story = {
  args: {
    center: [-74.6, 40.1],
    zoom: 11,
    route: mainRoute,
    tributaries: tributaries,
    onTributaryHover: (tributaryId) => console.log('Tributary hover:', tributaryId),
    onTributaryClick: (tributaryId) => console.log('Tributary clicked:', tributaryId),
  },
}

export const WithPOIs: Story = {
  args: {
    center: [-74.6, 40.1],
    zoom: 11,
    route: mainRoute,
    tributaries: tributaries,
    markers: poiMarkers,
    onMarkerClick: (markerId) => console.log('Marker clicked:', markerId),
  },
}

export const InteractiveRoute: Story = {
  args: {
    center: [-74.6, 40.1],
    zoom: 11,
    route: mainRoute,
    tributaries: tributaries,
    markers: poiMarkers,
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