import type { Meta, StoryObj } from '@storybook/react';
import { ElevationProfile } from './ElevationProfile';

const meta: Meta<typeof ElevationProfile> = {
  title: 'Visualization/ElevationProfile',
  component: ElevationProfile,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="h-[400px] w-full max-w-4xl mx-auto">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ElevationProfile>;

// Sample data for a moderate hiking trail
const moderateTrailPoints = Array.from({ length: 20 }, (_, i) => ({
  distance: i * 0.5, // Every 0.5 km
  elevation: 1000 + Math.sin(i * 0.5) * 200 + (i * 20), // Gradual elevation gain with some variation
}));

// Sample data for a challenging mountain trail
const mountainTrailPoints = Array.from({ length: 20 }, (_, i) => ({
  distance: i * 0.5,
  elevation: 2000 + Math.pow(Math.sin(i * 0.3), 2) * 800 + (i * 50), // Steeper elevation gains
}));

// Sample data for a flat urban trail
const urbanTrailPoints = Array.from({ length: 20 }, (_, i) => ({
  distance: i * 0.5,
  elevation: 100 + Math.random() * 20, // Minimal elevation changes
}));

export const ModerateTrail: Story = {
  args: {
    points: moderateTrailPoints,
  },
};

export const MountainTrail: Story = {
  args: {
    points: mountainTrailPoints,
  },
};

export const UrbanTrail: Story = {
  args: {
    points: urbanTrailPoints,
  },
}; 