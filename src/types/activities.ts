export type ActivityType = 
  | 'hiking'
  | 'cycling'
  | 'running'
  | 'skiing'
  | 'walking'
  | 'climbing';

export type SurfaceType = 
  | 'paved'
  | 'gravel'
  | 'trail'
  | 'snow'
  | 'mixed';

export interface EnvironmentalConditions {
  weather: {
    condition: 'clear' | 'cloudy' | 'rain' | 'snow';
    temperature: number;
    windSpeed: number;
    precipitation: number;
  };
  terrain: {
    surface: SurfaceType[];
    condition: 'dry' | 'wet' | 'icy' | 'muddy';
    difficulty: 'easy' | 'moderate' | 'hard';
  };
  daylight: {
    isDaytime: boolean;
    sunriseTime: number;
    sunsetTime: number;
  };
}

export interface ActivityPreferences {
  type: ActivityType;
  difficulty: 'easy' | 'moderate' | 'hard';
  duration: {
    min: number;
    max: number;
  };
  surfaces: SurfaceType[];
  avoidances: string[];
} 