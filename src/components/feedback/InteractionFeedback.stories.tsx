import type { Meta, StoryObj } from '@storybook/react';
import { InteractionFeedback } from './InteractionFeedback';

const meta: Meta<typeof InteractionFeedback> = {
  title: 'Feedback/InteractionFeedback',
  component: InteractionFeedback,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof InteractionFeedback>;

export const Success: Story = {
  args: {
    feedback: [
      {
        id: '1',
        message: 'Route saved successfully!',
        type: 'success',
      },
    ],
  },
};

export const Error: Story = {
  args: {
    feedback: [
      {
        id: '1',
        message: 'Failed to save route. Please try again.',
        type: 'error',
      },
    ],
  },
};

export const Warning: Story = {
  args: {
    feedback: [
      {
        id: '1',
        message: 'This route contains steep sections',
        type: 'warning',
      },
    ],
  },
};

export const Info: Story = {
  args: {
    feedback: [
      {
        id: '1',
        message: 'Weather data updated',
        type: 'info',
      },
    ],
  },
};

export const Multiple: Story = {
  args: {
    feedback: [
      {
        id: '1',
        message: 'Route saved successfully!',
        type: 'success',
      },
      {
        id: '2',
        message: 'Weather alert: Rain expected',
        type: 'warning',
      },
      {
        id: '3',
        message: 'New features available',
        type: 'info',
      },
    ],
  },
}; 