import type { Meta, StoryObj } from '@storybook/react';
import { NavigationBar } from '../navigation/NavigationBar';

const meta: Meta<typeof NavigationBar> = {
  title: 'Layout/NavigationBar',
  component: NavigationBar,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="min-h-[200px] bg-stone-900">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof NavigationBar>;

export const Default: Story = {
  args: {
    isLandingPage: false,
  },
};

export const LandingPage: Story = {
  args: {
    isLandingPage: true,
  },
};

export const LoggedIn: Story = {
  args: {
    isLandingPage: false,
    user: {
      name: 'John Doe',
      image: 'https://avatars.githubusercontent.com/u/1?v=4',
    },
  },
};

export const LoggedInNoImage: Story = {
  args: {
    isLandingPage: false,
    user: {
      name: 'John Doe',
    },
  },
}; 