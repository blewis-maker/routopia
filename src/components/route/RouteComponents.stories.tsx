import type { Meta, StoryObj } from '@storybook/react';
import { RouteGPT } from './RouteGPT';
import { RoutePanel } from './RoutePanel';
import { RoutesWrapper } from './RoutesWrapper';
import { TrafficOverlay } from './TrafficOverlay';

const meta = {
  title: 'Components/Route',
  component: RoutePanel,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof RoutePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Panel: Story = {
  render: () => (
    <RoutePanel
      route={{
        name: 'Mountain Trail',
        distance: 8.5,
        elevation: 750,
        duration: 180,
        difficulty: 'moderate',
      }}
      onEdit={() => console.log('Edit clicked')}
      onDelete={() => console.log('Delete clicked')}
    />
  ),
};

export const GPTAssistant: Story = {
  render: () => (
    <RouteGPT
      onSuggestion={(suggestion) => console.log('Suggestion:', suggestion)}
    />
  ),
};

export const RouteList: Story = {
  render: () => (
    <RoutesWrapper
      routes={[
        {
          id: 'route-1',
          name: 'Mountain Trail',
          distance: 8.5,
          elevation: 750,
          duration: 180,
          difficulty: 'moderate',
        },
        {
          id: 'route-2',
          name: 'Forest Loop',
          distance: 5.2,
          elevation: 350,
          duration: 120,
          difficulty: 'easy',
        },
      ]}
      onRouteSelect={(route) => console.log('Selected:', route)}
    />
  ),
};

export const Traffic: Story = {
  render: () => (
    <TrafficOverlay
      routeId="route-1"
      onTrafficUpdate={(data) => console.log('Traffic data:', data)}
    />
  ),
}; 