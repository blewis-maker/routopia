import type { Meta, StoryObj } from '@storybook/react'
import { AIChat } from './index'

const meta = {
  title: 'Components/Shared/AIChat',
  component: AIChat,
  parameters: {
    layout: 'padded',
  },
  args: {
    initialMessage: 'How can I help you plan your route today?',
    suggestions: [
      'Find scenic routes near me',
      'Suggest a cycling route',
      'Find coffee stops along my route',
    ],
  },
} satisfies Meta<typeof AIChat>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}

export const WithActiveConversation: Story = {
  args: {
    messages: [
      { role: 'assistant', content: 'How can I help you plan your route today?' },
      { role: 'user', content: 'I want to find a scenic route near New York' },
      { role: 'assistant', content: 'I\'ve found several scenic routes near New York. Here are some options...' },
    ],
  },
}

export const Loading: Story = {
  args: {
    messages: [
      { role: 'assistant', content: 'How can I help you plan your route today?' },
      { role: 'user', content: 'I want to find a scenic route near New York' },
    ],
    isLoading: true,
  },
}

export const Error: Story = {
  args: {
    error: 'Failed to connect to AI service',
  },
} 