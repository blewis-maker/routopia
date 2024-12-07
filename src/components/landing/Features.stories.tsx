import type { Meta, StoryObj } from '@storybook/react';
import Features from './Features';

const meta: Meta<typeof Features> = {
  title: 'Landing/Features',
  component: Features,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Features>;

export const Default: Story = {};

// Story with custom background for better visibility
export const WithCustomBackground: Story = {
  decorators: [
    (Story) => (
      <div className="bg-stone-950 py-12">
        <Story />
      </div>
    ),
  ],
}; 