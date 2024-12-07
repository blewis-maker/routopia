import type { Meta, StoryObj } from '@storybook/react';
import { CommunityDashboard } from './CommunityDashboard';
import { EnhancedFeatureVoting } from './EnhancedFeatureVoting';
import { RouteSharing } from './RouteSharing';

const meta = {
  title: 'Components/Community',
  component: CommunityDashboard,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof CommunityDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Dashboard: Story = {
  render: () => <CommunityDashboard />,
};

export const FeatureVoting: Story = {
  render: () => (
    <EnhancedFeatureVoting
      feature={{
        id: 'feature-1',
        title: 'Advanced Route Planning',
        description: 'AI-powered route suggestions based on preferences',
        votes: 245,
        status: 'in-progress',
      }}
    />
  ),
};

export const RouteShare: Story = {
  render: () => (
    <RouteSharing
      route={{
        id: 'route-1',
        name: 'Mountain Trail',
        type: 'hiking',
        stats: {
          distance: 8.5,
          elevation: 750,
          duration: 240,
        },
      }}
    />
  ),
}; 