import type { Meta, StoryObj } from '@storybook/react'
import { ActivityTracker } from './index'

const meta = {
  title: 'Components/ActivityTracker',
  component: ActivityTracker,
} satisfies Meta<typeof ActivityTracker>

export default meta
type Story = StoryObj<typeof ActivityTracker>

export const Default: Story = {
  args: {
    activities: [
      {
        id: '1',
        type: 'running',
        name: 'Morning Run',
        distance: 5.2,
        duration: 45,
        elevation: 100,
        date: '2024-01-20',
      },
      {
        id: '2',
        type: 'cycling',
        name: 'Evening Ride',
        distance: 15.5,
        duration: 60,
        elevation: 250,
        date: '2024-01-19',
      },
      {
        id: '3',
        type: 'hiking',
        name: 'Weekend Trail',
        distance: 8.3,
        duration: 120,
        elevation: 450,
        date: '2024-01-18',
      },
    ],
  },
}

export const Loading: Story = {
  args: {
    loading: true,
  },
}

export const Error: Story = {
  args: {
    error: 'Unable to load activity data',
  },
}

export const Empty: Story = {
  args: {
    activities: [],
  },
} 