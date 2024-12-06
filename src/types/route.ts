import { ActivityType } from './activity';
import type { POI } from './poi';

export interface Route {
  id: string;
  name: string;
  activityType: ActivityType;
  startLocation: string;
  endLocation: string;
  distance: number;
  duration: number;
  elevation: {
    gain: number;
    loss: number;
  };
  waypoints: {
    lat: number;
    lng: number;
    name?: string;
  }[];
  pois: POI[];
  createdAt: string;
  updatedAt: string;
  stats?: {
    difficulty: 'easy' | 'moderate' | 'hard';
    terrain: string[];
    surface: string[];
    seasonality: string[];
  };
  weather?: {
    temperature: number;
    condition: string;
    wind: number;
    precipitation: number;
  };
  traffic?: {
    level: 'low' | 'moderate' | 'high';
    incidents: {
      type: string;
      description: string;
      location: [number, number];
    }[];
  };
}

export interface RoutePreview {
  id: string;
  name: string;
  activityType: ActivityType;
  startLocation: string;
  endLocation: string;
  distance: number;
  duration: number;
  createdAt: string;
  thumbnail?: string;
}

export type Point = [number, number]; 