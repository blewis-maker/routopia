import type { Meta, StoryObj } from '@storybook/react';
import MarketingPage from './page';
import MarketingLayout from './layout';

const meta = {
  title: 'Pages/Marketing',
  component: MarketingPage,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <MarketingLayout>
        <Story />
      </MarketingLayout>
    ),
  ],
} satisfies Meta<typeof MarketingPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LandingPage: Story = {
  args: {},
}; 