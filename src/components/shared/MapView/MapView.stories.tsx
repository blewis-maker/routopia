import type { Meta, StoryObj } from '@storybook/react'
import { MapView } from './index'

const meta = {
  title: 'Components/Shared/MapView',
  component: MapView,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof MapView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    center: [-74.5, 40],
    zoom: 9,
  },
}

export const WithMarkers: Story = {
  args: {
    center: [-74.5, 40],
    zoom: 9,
    markers: [
      { id: '1', position: [-74.5, 40], label: 'Point A' },
      { id: '2', position: [-74.6, 40.1], label: 'Point B' },
    ],
  },
}

export const WithRoute: Story = {
  args: {
    center: [-74.5, 40],
    zoom: 9,
    route: {
      id: '1',
      coordinates: [
        [-74.5, 40],
        [-74.6, 40.1],
        [-74.7, 40.2],
      ],
    },
  },
} 