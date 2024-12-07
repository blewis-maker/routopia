import type { Meta, StoryObj } from '@storybook/react'
import { AIChat } from './index'

const meta = {
  title: 'Components/Shared/AIChat',
  component: AIChat,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof AIChat>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  args: {
    messages: [],
  },
}

export const WithMessages: Story = {
  args: {
    messages: [
      { role: 'user', content: 'Can you help me plan a route?' },
      { role: 'assistant', content: 'Of course! Where would you like to start?' },
      { role: 'user', content: 'I want to go from New York to Boston' },
      { 
        role: 'assistant', 
        content: 'I can help you plan that route. The distance is about 215 miles. Would you prefer:' +
                '\n1. The fastest route via I-95' +
                '\n2. A scenic route along the coast' +
                '\n3. A route with interesting stops along the way'
      },
    ],
  },
}

export const Loading: Story = {
  args: {
    messages: [
      { role: 'user', content: 'What are some good stops along the way?' },
    ],
    isLoading: true,
  },
}

export const Error: Story = {
  args: {
    messages: [
      { role: 'user', content: 'What are some good stops along the way?' },
    ],
    error: 'Failed to connect to AI service',
  },
} 