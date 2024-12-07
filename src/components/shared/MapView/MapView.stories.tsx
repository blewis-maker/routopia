import type { Meta, StoryObj } from '@storybook/react'
import { MapView } from './index'

const meta = {
  title: 'Components/Shared/MapView',
  component: MapView,
  parameters: {
    layout: 'fullscreen',
    chromatic: { delay: 1000 }, // Wait for map to load
  },
  args: {
    center: [-74.5, 40],
    zoom: 9,
  },
} satisfies Meta<typeof MapView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}

export const WithMarkers: Story = {
  args: {
    markers: [
      { lat: 40, lng: -74, label: 'Start' },
      { lat: 40.1, lng: -74.2, label: 'End' },
    ],
  },
}

export const WithRoute: Story = {
  args: {
    route: {
      coordinates: [
        [-74, 40],
        [-74.1, 40.05],
        [-74.2, 40.1],
      ],
      color: '#FF0000',
    },
  },
} 