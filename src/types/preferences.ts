import { 
  BikeEquipment, 
  SkiEquipment, 
  RunEquipment, 
  ActivityVariation 
} from './activities';

export interface PackingList {
  id: string;
  userId: string;
  name: string;
  items: string[];
  activityType: string;
  weather?: string[];
  duration: 'day' | 'overnight' | 'multiday';
  lastUpdated: Date;
}

export interface ActivityPreferences {
  defaultActivity: string;
  skillLevel: string;
  equipment: {
    bike?: BikeEquipment;
    ski?: SkiEquipment;
    run?: RunEquipment;
  };
  variations: ActivityVariation;
}

export interface ComfortPreferences {
  temperature: {
    preferred: [number, number];
    tolerable: [number, number];
  };
  weather: {
    preferred: string[];
    avoid: string[];
  };
  terrain: {
    preferred: string[];
    avoid: string[];
  };
  restStops: {
    frequency: number;
    duration: number;
    types: string[];
  };
}

export interface GroupTripPreferences {
  members: {
    id: string;
    role: 'leader' | 'participant';
    preferences: ActivityPreferences;
  }[];
  schedule: {
    startTime: string;
    endTime?: string;
    breaks: {
      frequency: number;
      duration: number;
    };
  };
  communication: {
    method: string;
    checkpoints: number;
  };
} 