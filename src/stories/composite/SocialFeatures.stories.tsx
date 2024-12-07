import type { Meta, StoryObj } from '@storybook/react';
import { MainApplicationView } from '@/components/app/MainApplicationView';

const meta = {
  title: 'Flows/SocialFeatures',
  component: MainApplicationView,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Social features and community interactions.',
      },
    },
  },
} satisfies Meta<typeof MainApplicationView>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleUser = {
  id: 'user-1',
  name: 'John Doe',
  avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
  stats: {
    routes: 15,
    followers: 120,
    following: 80,
  },
};

const samplePosts = [
  {
    id: 'post-1',
    author: sampleUser,
    content: 'Just completed an amazing mountain trail!',
    likes: 25,
    comments: 8,
  },
  {
    id: 'post-2',
    author: sampleUser,
    content: 'Found a hidden gem on today\'s hike.',
    likes: 42,
    comments: 12,
  },
];

export const CommunityHub: Story = {
  args: {
    currentView: 'community',
    posts: samplePosts,
    currentUser: sampleUser,
    featuredRoutes: [
      {
        id: 'route-1',
        name: 'Mountain Trail',
        distance: 8.5,
        elevation: 750,
        rating: 4.8,
      },
    ],
  },
};

export const UserProfileView: Story = {
  args: {
    currentView: 'profile',
    user: sampleUser,
    userRoutes: [
      {
        id: 'route-1',
        name: 'Mountain Trail',
        distance: 8.5,
        elevation: 750,
      },
    ],
  },
};

export const RouteSharingView: Story = {
  args: {
    currentView: 'share',
    route: {
      id: 'route-1',
      name: 'Mountain Trail',
      type: 'hiking',
      metrics: {
        distance: 8.5,
        elevation: 750,
        duration: 240,
      },
    },
  },
};

export const ActivityFeed: Story = {
  args: {
    currentView: 'feed',
    activities: [
      {
        id: 'activity-1',
        user: sampleUser,
        type: 'route_completed',
        route: {
          id: 'route-1',
          name: 'Mountain Trail',
        },
        timestamp: new Date().toISOString(),
      },
    ],
  },
};

export const Notifications: Story = {
  args: {
    currentView: 'notifications',
    notifications: [
      {
        id: 'notif-1',
        type: 'like',
        user: sampleUser,
        content: 'liked your route',
        timestamp: new Date().toISOString(),
      },
    ],
  },
}; 