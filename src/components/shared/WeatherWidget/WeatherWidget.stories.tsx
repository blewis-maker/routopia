import type { Meta, StoryObj } from '@storybook/react'
import { WeatherWidget } from './index'

const meta = {
  title: 'Components/Shared/WeatherWidget',
  component: WeatherWidget,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof WeatherWidget>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    temperature: 20,
    conditions: 'Clear',
    location: 'New York, NY',
  },
}

export const Loading: Story = {
  args: {
    isLoading: true,
  },
}

export const Error: Story = {
  args: {
    error: 'Failed to load weather data',
  },
}

export const ExtremeCold: Story = {
  args: {
    temperature: -10,
    conditions: 'Snow',
    location: 'Montreal, CA',
  },
}

export const ExtremeHeat: Story = {
  args: {
    temperature: 35,
    conditions: 'Sunny',
    location: 'Phoenix, AZ',
  },
} 