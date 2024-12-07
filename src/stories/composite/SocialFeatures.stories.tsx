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
type Story = StoryObj<typeof MainApplicationView>;

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
    currentUser: sampleUser,
    posts: samplePosts,
    route: {
      id: 'route-1',
      name: 'Mountain Trail',
      distance: 8.5,
      elevation: 750,
      type: 'hiking',
      difficulty: 'moderate',
    },
  },
};

export const UserProfileView: Story = {
  args: {
    currentView: 'profile',
    currentUser: sampleUser,
    userRoutes: [
      {
        id: 'route-2',
        name: 'Forest Loop',
        distance: 5.2,
        elevation: 350,
        type: 'hiking',
        difficulty: 'easy',
      },
    ],
  },
};

export const RouteSharingView: Story = {
  args: {
    currentView: 'share',
    currentUser: sampleUser,
    route: {
      id: 'route-3',
      name: 'Mountain Trail',
      distance: 8.5,
      elevation: 750,
      type: 'hiking',
      difficulty: 'moderate',
    },
  },
};

export const ActivityFeed: Story = {
  args: {
    currentView: 'feed',
    currentUser: sampleUser,
    posts: samplePosts,
    activities: [
      {
        id: 'activity-1',
        type: 'route_completed',
        user: sampleUser,
        route: {
          id: 'route-4',
          name: 'Valley Path',
          distance: 6.3,
          elevation: 450,
          type: 'hiking',
          difficulty: 'moderate',
        },
        timestamp: new Date().toISOString(),
      },
    ],
  },
};

export const Notifications: Story = {
  args: {
    currentView: 'notifications',
    currentUser: sampleUser,
    notifications: [
      {
        id: 'notif-1',
        type: 'route_like',
        user: sampleUser,
        route: {
          id: 'route-5',
          name: 'Ridge Trail',
          distance: 7.8,
          elevation: 850,
          type: 'hiking',
          difficulty: 'hard',
        },
        timestamp: new Date().toISOString(),
      },
    ],
  },
}; 