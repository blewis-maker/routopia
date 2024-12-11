import { Achievement, ActivityType } from '@/types/activities/activityTypes';

export const achievements: Achievement[] = [
  // Distance Achievements
  {
    id: 'distance_5k',
    name: '5K Runner',
    description: 'Complete a 5K run',
    type: 'running',
    criteria: {
      metric: 'distance',
      value: 5000,
      operator: 'gte'
    },
    icon: '🏃',
    points: 100
  },
  {
    id: 'distance_10k',
    name: '10K Warrior',
    description: 'Complete a 10K run',
    type: 'running',
    criteria: {
      metric: 'distance',
      value: 10000,
      operator: 'gte'
    },
    icon: '🏃‍♂️',
    points: 200
  },
  // Elevation Achievements
  {
    id: 'elevation_500',
    name: 'Hill Climber',
    description: 'Climb 500m in elevation',
    type: 'hiking',
    criteria: {
      metric: 'elevation',
      value: 500,
      operator: 'gte'
    },
    icon: '⛰️',
    points: 150
  },
  // Speed Achievements
  {
    id: 'speed_30',
    name: 'Speed Demon',
    description: 'Achieve 30km/h average speed',
    type: 'cycling',
    criteria: {
      metric: 'averageSpeed',
      value: 8.33, // m/s
      operator: 'gte'
    },
    icon: '🚴',
    points: 300
  },
  // Streak Achievements
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Complete activities 7 days in a row',
    type: 'any',
    criteria: {
      metric: 'streak',
      value: 7,
      operator: 'gte'
    },
    icon: '🔥',
    points: 500
  }
];

export const achievementCategories = {
  distance: ['distance_5k', 'distance_10k'],
  elevation: ['elevation_500'],
  speed: ['speed_30'],
  streak: ['streak_7']
};

export const achievementTiers = {
  bronze: 1000,
  silver: 2500,
  gold: 5000,
  platinum: 10000
}; 