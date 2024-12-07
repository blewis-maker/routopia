import type { Meta, StoryObj } from '@storybook/react';
import { CommunityDashboard } from './CommunityDashboard';
import { EnhancedFeatureVoting } from './EnhancedFeatureVoting';
import { RouteSharing } from './RouteSharing';

interface MetricFilter {
  type: string;
  value: string;
}

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
  args: {
    onFeatureSelect: (featureId: string) => console.log('Selected feature:', featureId),
    onMetricFilter: (filter: MetricFilter) => console.log('Applied filter:', filter),
  },
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
      onVote={(featureId: string, vote: 'up' | 'down') => 
        console.log('Vote:', { featureId, vote })
      }
      onComment={(featureId: string, comment: string) => 
        console.log('Comment:', { featureId, comment })
      }
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
      onShare={(routeId: string) => console.log('Shared route:', routeId)}
    />
  ),
}; 