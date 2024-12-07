import type { Meta, StoryObj } from '@storybook/react';
import { MainApplicationView } from '@/components/app/MainApplicationView';

const testRoute = {
  id: 'route-1',
  name: 'Boulder Flatirons Trail',
  type: 'hiking',
  difficulty: 'moderate',
  distance: 8.5,
  elevation: 450,
  duration: 180,
  coordinates: [
    { lat: 39.9994, lng: -105.2909, elevation: 1740 }, // Chautauqua Park
    { lat: 39.9982, lng: -105.2927, elevation: 1780 },
    { lat: 39.9971, lng: -105.2935, elevation: 1820 },
    { lat: 39.9962, lng: -105.2945, elevation: 1860 },
    { lat: 39.9954, lng: -105.2952, elevation: 1900 },
  ],
};

const meta = {
  title: 'Views/MainApplication',
  component: MainApplicationView,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof MainApplicationView>;

export default meta;
type Story = StoryObj<typeof MainApplicationView>;

export const Default: Story = {
  args: {
    route: testRoute,
  },
};

export const InitialState: Story = {
  args: {
    route: undefined,
  },
};

export const Loading: Story = {
  args: {
    route: undefined,
    loading: true,
  },
};

export const WithRoute: Story = {
  args: {
    route: {
      ...testRoute,
      name: 'Boulder Flatirons Loop',
      difficulty: 'moderate',
      distance: 5.5,
      duration: 180,
    },
  },
};

export const WithError: Story = {
  args: {
    route: undefined,
    error: new Error('Unable to load route data. Please check your connection and try again.'),
  },
}; 