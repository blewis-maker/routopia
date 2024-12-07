import type { Meta, StoryObj } from '@storybook/react';
import { MapLegend } from './MapLegend';

const meta = {
  title: 'Map/MapLegend',
  component: MapLegend,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof MapLegend>;

export default meta;
type Story = StoryObj<typeof MapLegend>;

export const Default: Story = {
  args: {},
};

export const CustomItems: Story = {
  args: {
    items: [
      {
        color: '#2563EB',
        label: 'Main Route (Car)',
        type: 'route',
      },
      {
        color: '#10B981',
        label: 'Hiking Trail',
        type: 'tributary',
      },
      {
        color: '#8B5CF6',
        label: 'Historic Sites',
        type: 'tributary',
      },
      {
        color: '#F59E0B',
        label: 'Bike Path',
        type: 'tributary',
      },
      {
        color: '#EF4444',
        label: 'Viewpoints',
        type: 'poi',
      },
      {
        color: '#6366F1',
        label: 'Restaurants',
        type: 'poi',
      },
    ],
  },
}; 