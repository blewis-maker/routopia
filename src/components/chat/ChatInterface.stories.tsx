import type { Meta, StoryObj } from '@storybook/react';
import { ChatInterface } from './ChatInterface';

const meta = {
  title: 'Components/Chat/ChatInterface',
  component: ChatInterface,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof ChatInterface>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    initialMessages: [],
  },
};

export const WithHistory: Story = {
  args: {
    initialMessages: [
      { id: '1', content: 'Hello!', sender: 'user' },
      { id: '2', content: 'Hi there! How can I help you?', sender: 'assistant' },
    ],
  },
}; 