import type { Meta, StoryObj } from '@storybook/react';
import MarketingPage from './page';
import MarketingLayout from './layout';
import { AppRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';

// Mock router context
const mockRouter = {
  back: () => Promise.resolve(),
  forward: () => Promise.resolve(),
  push: () => Promise.resolve(),
  replace: () => Promise.resolve(),
  refresh: () => Promise.resolve(),
  prefetch: () => Promise.resolve(),
  route: '/',
  pathname: '/',
  params: {},
  query: {},
  asPath: '/',
};

const meta = {
  title: 'Pages/Marketing',
  component: MarketingPage,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/',
        query: {},
      },
    },
  },
  decorators: [
    (Story) => (
      <AppRouterContext.Provider value={mockRouter}>
        <div className="min-h-screen bg-background">
          <MarketingLayout>
            <Story />
          </MarketingLayout>
        </div>
      </AppRouterContext.Provider>
    ),
  ],
} satisfies Meta<typeof MarketingPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LandingPage: Story = {
  args: {},
  parameters: {
    layout: 'fullscreen',
  },
}; 