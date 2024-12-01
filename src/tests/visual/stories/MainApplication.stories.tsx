import type { Meta, StoryObj } from '@storybook/react';
import { MainApplicationView } from '@/components/app/MainApplicationView';
import { testData } from '../../data/testData';

const meta: Meta<typeof MainApplicationView> = {
  title: 'Views/MainApplication',
  component: MainApplicationView,
  parameters: {
    layout: 'fullscreen',
    chromatic: { viewports: [320, 768, 1440] }
  }
};

export default meta;
type Story = StoryObj<typeof MainApplicationView>;

export const Default: Story = {
  args: {
    initialData: testData
  }
};

export const Loading: Story = {
  args: {
    initialData: null,
    loading: true
  }
};

export const WithRoute: Story = {
  args: {
    initialData: {
      ...testData,
      currentRoute: testData.routes[0]
    }
  }
};

export const WithError: Story = {
  args: {
    initialData: testData,
    error: new Error('Failed to load route')
  }
}; 