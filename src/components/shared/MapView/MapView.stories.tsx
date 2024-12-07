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

export const Default: Story = {
  args: {
    center: [-104.9903, 39.7392],
    zoom: 12,
  },
}

export const WithMarkers: Story = {
  args: {
    center: [-74.5, 40],
    zoom: 9,
    markers: [
      {
        id: '1',
        position: [-74.5, 40],
        label: 'Start',
      },
      {
        id: '2',
        position: [-74.6, 40.1],
        label: 'End',
      },
    ],
  },
}

export const WithRoute: Story = {
  args: {
    center: [-74.5, 40],
    zoom: 9,
    route: {
      coordinates: [
        [-74.5, 40],
        [-74.6, 40.1],
        [-74.7, 40.15],
      ],
      color: '#10B981',
    },
  },
} 