export interface ActivityBase {
  id: string;
  name: string;
  icon: string;
  metrics: string[];
  difficultyLevels: string[];
  terrainTypes: string[];
  weatherConditions: string[];
}

export const activityTypes = {
  hiking: {
    id: 'hiking',
    name: 'Hiking',
    icon: 'hiking-icon',
    metrics: ['distance', 'elevation', 'duration'],
    difficultyLevels: ['easy', 'moderate', 'challenging', 'extreme'],
    terrainTypes: ['trail', 'mountain', 'forest', 'coastal'],
    weatherConditions: ['clear', 'cloudy', 'light-rain']
  },

  cycling: {
    id: 'cycling',
    name: 'Cycling',
    icon: 'cycling-icon',
    metrics: ['distance', 'speed', 'elevation', 'duration'],
    difficultyLevels: ['beginner', 'intermediate', 'advanced', 'expert'],
    terrainTypes: ['road', 'trail', 'mountain', 'gravel'],
    weatherConditions: ['clear', 'cloudy', 'light-wind']
  },

  running: {
    id: 'running',
    name: 'Running',
    icon: 'running-icon',
    metrics: ['distance', 'pace', 'elevation', 'duration'],
    difficultyLevels: ['beginner', 'intermediate', 'advanced', 'elite'],
    terrainTypes: ['road', 'trail', 'track', 'beach'],
    weatherConditions: ['clear', 'cloudy', 'light-rain', 'moderate-temp']
  },

  // Add more activities...
  climbing: {
    id: 'climbing',
    name: 'Climbing',
    icon: 'climbing-icon',
    metrics: ['grade', 'elevation', 'duration'],
    difficultyLevels: ['5.5-5.7', '5.8-5.9', '5.10-5.11', '5.12+'],
    terrainTypes: ['sport', 'trad', 'boulder', 'alpine'],
    weatherConditions: ['clear', 'dry', 'moderate-temp']
  }
} as const; 