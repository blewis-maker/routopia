import type { Meta, StoryObj } from '@storybook/react'
import { WeatherWidget } from './index'

const meta = {
  title: 'Components/WeatherWidget',
  component: WeatherWidget,
} satisfies Meta<typeof WeatherWidget>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    data: {
      temperature: 72,
      condition: 'Partly Cloudy',
      icon: '⛅',
      precipitation: 10,
      windSpeed: 5,
      humidity: 45,
    },
  },
}

export const Loading: Story = {
  args: {
    loading: true,
  },
}

export const Error: Story = {
  args: {
    error: 'Unable to fetch weather data',
  },
}

export const ExtremeCold: Story = {
  args: {
    data: {
      temperature: -10,
      condition: 'Snow',
      icon: '🌨️',
      precipitation: 90,
      windSpeed: 15,
      humidity: 80,
    },
  },
}

export const ExtremeHeat: Story = {
  args: {
    data: {
      temperature: 95,
      condition: 'Sunny',
      icon: '☀️',
      precipitation: 0,
      windSpeed: 8,
      humidity: 20,
    },
  },
} 