import type { Meta, StoryObj } from '@storybook/react';
import AppShell from './AppShell';

const meta: Meta<typeof AppShell> = {
  title: 'Layout/AppShell',
  component: AppShell,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof AppShell>;

export const Default: Story = {
  args: {
    children: (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Welcome to Routopia</h1>
        <p className="text-gray-600">This is a sample content inside the AppShell.</p>
      </div>
    ),
  },
};

export const WithDarkMode: Story = {
  args: {
    children: (
      <div className="p-8 bg-stone-950 text-white min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Welcome to Routopia</h1>
        <p className="text-stone-400">This is a sample content inside the AppShell in dark mode.</p>
      </div>
    ),
  },
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
}; 