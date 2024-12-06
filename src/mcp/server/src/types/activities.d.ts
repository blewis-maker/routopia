declare module 'activities' {
  export interface Activity {
    type: 'WALK' | 'RUN' | 'BIKE';
    duration: number;
    distance: number;
    elevation?: number;
  }

  export interface ActivityPreferences {
    avoidHills?: boolean;
    preferScenic?: boolean;
    maxDistance?: number;
  }
} 