import type { Meta, StoryObj } from '@storybook/react';
import { MainApplicationView } from '@/components/app/MainApplicationView';
import type { Route } from '@/components/app/MainApplicationView';

const meta = {
  title: 'Components/Route',
  component: MainApplicationView,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof MainApplicationView>;

export default meta;
type Story = StoryObj<typeof MainApplicationView>;

const sampleRoute: Route = {
  id: 'route-1',
  name: 'Mountain Trail',
  type: 'hiking',
  distance: 8.5,
  elevation: 750,
  duration: 180,
  difficulty: 'moderate',
};

export const NewRoute: Story = {
  args: {
    currentView: 'route',
    route: {
      id: 'new',
      name: '',
      type: 'hiking',
      distance: 0,
      elevation: 0,
    },
  },
};

export const RouteInProgress: Story = {
  args: {
    currentView: 'route',
    route: {
      ...sampleRoute,
      id: 'in-progress',
      name: 'New Mountain Trail',
    },
  },
};

export const RouteComplete: Story = {
  args: {
    currentView: 'route',
    route: sampleRoute,
  },
};

export const RouteOptimization: Story = {
  args: {
    currentView: 'route',
    route: {
      ...sampleRoute,
      id: 'optimized',
      name: 'Optimized Mountain Trail',
    },
  },
}; 