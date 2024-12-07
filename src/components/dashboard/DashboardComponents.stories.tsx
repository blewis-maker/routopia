import type { Meta, StoryObj } from '@storybook/react';
import { WeatherVisualization } from './WeatherVisualization';
import { ActivityStats } from './ActivityStats';
import { RouteProgress } from './RouteProgress';

const meta = {
  title: 'Components/Dashboard',
  component: WeatherVisualization,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof WeatherVisualization>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Weather: Story = {
  render: () => (
    <WeatherVisualization
      data={{
        temperature: 22,
        condition: 'sunny',
        windSpeed: 12,
        humidity: 45,
      }}
    />
  ),
};

export const Activity: Story = {
  render: () => (
    <ActivityStats
      stats={{
        totalDistance: 125.5,
        totalElevation: 2500,
        totalTime: 1800,
        completedRoutes: 12,
      }}
    />
  ),
};

export const Progress: Story = {
  render: () => (
    <RouteProgress
      route={{
        id: 'route-1',
        name: 'Mountain Trail',
        progress: 75,
        nextMilestone: 'Summit viewpoint',
        remainingDistance: 2.5,
      }}
    />
  ),
}; 