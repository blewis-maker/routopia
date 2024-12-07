import type { Meta, StoryObj } from '@storybook/react'
import { ActivityTracker } from './index'

const meta = {
  title: 'Components/Shared/ActivityTracker',
  component: ActivityTracker,
  parameters: {
    layout: 'centered',
  },
  args: {
    activities: [
      {
        id: '1',
        type: 'cycling',
        distance: 15.2,
        duration: 3600,
        date: new Date('2024-03-15'),
        route: {
          name: 'Central Park Loop',
          startPoint: 'Central Park South',
          endPoint: 'Central Park South',
        },
      },
      {
        id: '2',
        type: 'running',
        distance: 5.0,
        duration: 1800,
        date: new Date('2024-03-14'),
        route: {
          name: 'Riverside Run',
          startPoint: 'Riverside Park',
          endPoint: 'Riverside Park',
        },
      },
    ],
  },
} satisfies Meta<typeof ActivityTracker>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}

export const Empty: Story = {
  args: {
    activities: [],
  },
}

export const Loading: Story = {
  args: {
    isLoading: true,
  },
}

export const WithFilters: Story = {
  args: {
    showFilters: true,
    activityTypes: ['cycling', 'running', 'hiking'],
    dateRange: {
      start: new Date('2024-03-01'),
      end: new Date('2024-03-15'),
    },
  },
}

export const WithStats: Story = {
  args: {
    showStats: true,
    stats: {
      totalDistance: 150.5,
      totalDuration: 36000,
      averageSpeed: 15.2,
      activityCount: 10,
    },
  },
} 