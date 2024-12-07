import type { Meta, StoryObj } from '@storybook/react';
import { MainApplicationView } from '@/components/app/MainApplicationView';
import { RouteVisualization } from '@/components/visualization/RouteVisualization';
import { ElevationProfile } from '@/components/visualization/ElevationProfile';
import { WeatherWidget } from '@/components/shared/WeatherWidget';
import { TrafficOverlay } from '@/components/TrafficOverlay';

const meta = {
  title: 'Flows/AdvancedFeatures',
  component: MainApplicationView,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Advanced feature integration showcasing complex interactions and data visualization.',
      },
    },
  },
} satisfies Meta<typeof MainApplicationView>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample complex route data
const complexRoute = {
  id: 'route-2',
  name: 'Mount Sanitas Loop',
  type: 'hiking',
  difficulty: 'hard',
  distance: 5.2,
  elevation: 450,
  duration: 180,
  coordinates: [
    { lat: 40.0219, lng: -105.3046, elevation: 1740 },
    { lat: 40.0225, lng: -105.3052, elevation: 1780 },
    { lat: 40.0231, lng: -105.3058, elevation: 1820 },
    { lat: 40.0237, lng: -105.3064, elevation: 1860 },
    { lat: 40.0243, lng: -105.3070, elevation: 1900 },
  ],
  features: [
    { type: 'viewpoint', location: [40.0225, -105.3052], name: 'Summit Vista' },
    { type: 'water', location: [40.0231, -105.3058], name: 'Mountain Stream' },
    { type: 'rest', location: [40.0237, -105.3064], name: 'Rest Area' },
  ],
  conditions: {
    trail: 'rocky',
    exposure: 'high',
    technicality: 'moderate',
  },
};

// Sample advanced weather data
const advancedWeather = {
  current: {
    temperature: 68,
    condition: 'Partly Cloudy',
    icon: '⛅',
    precipitation: 20,
    windSpeed: 8,
    humidity: 55,
  },
  forecast: [
    { time: '09:00', temp: 65, condition: '🌤️' },
    { time: '12:00', temp: 72, condition: '☀️' },
    { time: '15:00', temp: 70, condition: '⛅' },
    { time: '18:00', temp: 64, condition: '🌥️' },
  ],
  alerts: [
    {
      type: 'advisory',
      message: 'Afternoon thunderstorms possible',
      severity: 'moderate',
    },
  ],
};

// Sample traffic data
const trafficData = {
  segments: [
    {
      id: '1',
      start: [40.0219, -105.3046],
      end: [40.0225, -105.3052],
      congestion: 'low',
    },
    {
      id: '2',
      start: [40.0225, -105.3052],
      end: [40.0231, -105.3058],
      congestion: 'medium',
      incident: {
        type: 'construction',
        description: 'Trail maintenance in progress',
      },
    },
  ],
};

export const AdvancedVisualization: Story = {
  args: {
    route: complexRoute,
    weather: advancedWeather,
    traffic: trafficData,
    showAdvancedFeatures: true,
  },
};

export const WeatherIntegration: Story = {
  args: {
    route: complexRoute,
    weather: {
      ...advancedWeather,
      alerts: [
        {
          type: 'warning',
          message: 'Lightning risk high after 2 PM',
          severity: 'high',
          affectedAreas: [
            { lat: 40.0225, lng: -105.3052 },
            { lat: 40.0231, lng: -105.3058 },
          ],
        },
      ],
    },
  },
};

export const TrafficAnalysis: Story = {
  args: {
    route: complexRoute,
    traffic: {
      ...trafficData,
      incidents: [
        {
          id: '1',
          type: 'closure',
          location: [40.0231, -105.3058],
          description: 'Trail closed due to maintenance',
          duration: '2 hours',
        },
      ],
      alternateRoutes: [
        {
          id: 'alt-1',
          name: 'Eastern Bypass',
          coordinates: [
            { lat: 40.0219, lng: -105.3046 },
            { lat: 40.0228, lng: -105.3048 },
            { lat: 40.0237, lng: -105.3064 },
          ],
          congestion: 'low',
        },
      ],
    },
  },
};

export const ARFeatures: Story = {
  args: {
    route: complexRoute,
    arEnabled: true,
    arPoints: [
      {
        id: 'ar-1',
        type: 'waypoint',
        location: [40.0225, -105.3052],
        content: {
          title: 'Summit Vista',
          description: 'Panoramic views of the Flatirons',
          media: '/images/summit-vista.jpg',
        },
      },
      {
        id: 'ar-2',
        type: 'info',
        location: [40.0231, -105.3058],
        content: {
          title: 'Wildlife Area',
          description: 'Watch for mule deer and birds',
          media: '/images/wildlife.jpg',
        },
      },
    ],
  },
};

export const DataVisualization: Story = {
  args: {
    route: complexRoute,
    showAnalytics: true,
    analytics: {
      popularity: {
        daily: [12, 15, 25, 30, 28, 35, 40],
        peak: 'weekends',
      },
      difficulty: {
        technical: 7,
        physical: 8,
        exposure: 6,
      },
      seasonal: {
        best: ['spring', 'fall'],
        hazards: ['winter', 'summer'],
      },
    },
  },
}; 