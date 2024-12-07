import type { Meta, StoryObj } from '@storybook/react';
import { MainApplicationView } from '@/components/app/MainApplicationView';
import { AppShell } from '@/components/layout/AppShell';
import { MapView } from '@/components/shared/MapView';
import { AIChat } from '@/components/shared/AIChat';
import { WeatherWidget } from '@/components/shared/WeatherWidget';
import { ActivityTracker } from '@/components/shared/ActivityTracker';
import { RouteVisualization } from '@/components/visualization/RouteVisualization';
import { ElevationProfile } from '@/components/visualization/ElevationProfile';

const meta = {
  title: 'Flows/UserJourneys',
  component: MainApplicationView,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Composite stories showcasing complete user journeys and component integration.',
      },
    },
  },
} satisfies Meta<typeof MainApplicationView>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample route data
const sampleRoute = {
  id: 'route-1',
  name: 'Boulder Flatirons Trail',
  type: 'hiking',
  difficulty: 'moderate',
  distance: 8.5,
  elevation: 450,
  duration: 180,
  coordinates: [
    { lat: 39.9994, lng: -105.2909, elevation: 1740 },
    { lat: 39.9982, lng: -105.2927, elevation: 1780 },
    { lat: 39.9971, lng: -105.2935, elevation: 1820 },
    { lat: 39.9962, lng: -105.2945, elevation: 1860 },
    { lat: 39.9954, lng: -105.2952, elevation: 1900 },
  ],
};

// Sample weather data
const sampleWeather = {
  temperature: 72,
  condition: 'Partly Cloudy',
  icon: '⛅',
  precipitation: 10,
  windSpeed: 5,
  humidity: 45,
};

// Sample activities
const sampleActivities = [
  {
    id: '1',
    type: 'hiking',
    name: 'Morning Hike',
    distance: 5.2,
    duration: 45,
    elevation: 100,
    date: '2024-01-20',
  },
  {
    id: '2',
    type: 'cycling',
    name: 'Evening Ride',
    distance: 15.5,
    duration: 60,
    elevation: 250,
    date: '2024-01-19',
  },
];

// Sample chat messages
const sampleMessages = [
  { role: 'assistant', content: "Welcome! I can help you plan your route. Where would you like to go?" },
  { role: 'user', content: "I'd like to hike the Flatirons in Boulder" },
  { role: 'assistant', content: "Great choice! The Flatirons offer beautiful views. I've found a popular trail that matches your preferences." },
];

export const RoutePlanningJourney: Story = {
  args: {
    route: sampleRoute,
    weather: sampleWeather,
    activities: sampleActivities,
    messages: sampleMessages,
  },
};

export const ExplorationMode: Story = {
  args: {
    weather: sampleWeather,
    activities: sampleActivities,
    messages: [
      { role: 'assistant', content: "I can help you discover new routes. What type of activity are you interested in?" },
    ],
  },
};

export const ActivityTracking: Story = {
  args: {
    route: sampleRoute,
    weather: sampleWeather,
    activities: sampleActivities,
    activeActivity: {
      ...sampleActivities[0],
      status: 'in_progress',
      currentStats: {
        distance: 2.1,
        duration: 25,
        elevation: 180,
        pace: '12:30 min/km',
      },
    },
  },
};

export const WeatherAlert: Story = {
  args: {
    route: sampleRoute,
    weather: {
      ...sampleWeather,
      condition: 'Thunderstorm',
      icon: '⛈️',
      precipitation: 80,
      windSpeed: 15,
      alerts: [
        {
          type: 'warning',
          message: 'Thunderstorm warning in effect',
          severity: 'moderate',
        },
      ],
    },
    activities: sampleActivities,
  },
};

export const SocialSharing: Story = {
  args: {
    route: {
      ...sampleRoute,
      shared: true,
      likes: 42,
      comments: [
        {
          id: '1',
          user: 'Jane Doe',
          content: 'Great trail! The views are amazing.',
          timestamp: '2024-01-20T10:30:00Z',
        },
        {
          id: '2',
          user: 'John Smith',
          content: 'Watch out for the steep section near the top.',
          timestamp: '2024-01-20T11:15:00Z',
        },
      ],
    },
    weather: sampleWeather,
    activities: sampleActivities,
  },
}; 