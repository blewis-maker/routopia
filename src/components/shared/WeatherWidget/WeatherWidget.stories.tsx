import type { Meta, StoryObj } from '@storybook/react'
import WeatherWidget from './index'

const meta = {
  title: 'Components/WeatherWidget',
  component: WeatherWidget,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof WeatherWidget>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    // Add default props here
  },
} 