import type { Meta, StoryObj } from '@storybook/react';
import VideoBackground from './VideoBackground';

const meta: Meta<typeof VideoBackground> = {
  title: 'Landing/VideoBackground',
  component: VideoBackground,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof VideoBackground>;

export const Default: Story = {
  args: {
    videoUrl: '/hero-bg.mp4',
  },
};

export const WithFallback: Story = {
  args: {
    videoUrl: '/hero-bg.mp4',
    fallbackImage: '/hero-fallback.jpg',
  },
}; 