import type { Meta, StoryObj } from '@storybook/react'
import { ActivityTracker } from './index'

const meta = {
  title: 'Components/Shared/ActivityTracker',
  component: ActivityTracker,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof ActivityTracker>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  args: {
    activities: [],
  },
}

export const WithActivities: Story = {
  args: {
    activities: [
      {
        id: '1',
        type: 'route',
        name: 'Morning Run',
        distance: 5.2,
        duration: 1800,
        date: new Date('2023-12-07T08:00:00'),
      },
      {
        id: '2',
        type: 'cycling',
        name: 'Evening Ride',
        distance: 15.5,
        duration: 3600,
        date: new Date('2023-12-06T18:00:00'),
      },
      {
        id: '3',
        type: 'hiking',
        name: 'Weekend Trail',
        distance: 8.3,
        duration: 7200,
        date: new Date('2023-12-05T10:00:00'),
      },
    ],
  },
}

export const Loading: Story = {
  args: {
    isLoading: true,
  },
}

export const Error: Story = {
  args: {
    error: 'Failed to load activities',
  },
}

export const WithFilters: Story = {
  args: {
    activities: [
      {
        id: '1',
        type: 'route',
        name: 'Morning Run',
        distance: 5.2,
        duration: 1800,
        date: new Date('2023-12-07T08:00:00'),
      },
      {
        id: '2',
        type: 'cycling',
        name: 'Evening Ride',
        distance: 15.5,
        duration: 3600,
        date: new Date('2023-12-06T18:00:00'),
      },
    ],
    filters: {
      type: ['route', 'cycling'],
      dateRange: {
        start: new Date('2023-12-01'),
        end: new Date('2023-12-31'),
      },
    },
  },
} 