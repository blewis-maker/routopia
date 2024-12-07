import type { Meta, StoryObj } from '@storybook/react';
import DashboardPage from './page';
import DashboardLayout from './layout';
import RoutePlannerPage from './route-planner/page';
import ActivityHubPage from './activity-hub/page';
import POIExplorerPage from './poi-explorer/page';

// Client-side wrapper for stories
const StoryWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-background-primary">
      <nav className="h-16 border-b">Navigation Bar (Mock)</nav>
      <div className="flex">
        <aside className="w-64 border-r p-4">Sidebar (Mock)</aside>
        <main className="flex-1 p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

const meta = {
  title: 'Pages/Dashboard',
  component: DashboardPage,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
    },
  },
  decorators: [
    (Story) => (
      <StoryWrapper>
        <Story />
      </StoryWrapper>
    ),
  ],
} satisfies Meta<typeof DashboardPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  args: {},
};

export const RoutePlanner: Story = {
  render: () => <RoutePlannerPage />,
};

export const ActivityHub: Story = {
  render: () => <ActivityHubPage />,
};

export const POIExplorer: Story = {
  render: () => <POIExplorerPage />,
}; 