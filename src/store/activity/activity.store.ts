import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { ActivityType, ActivityPreferences, ActivityConstraints } from '@/types/activity.types';

interface ActivityState {
  // Core state
  currentActivity: ActivityType | null;
  preferences: ActivityPreferences;
  constraints: ActivityConstraints;
  history: Array<{
    activity: ActivityType;
    timestamp: number;
    duration: number;
  }>;

  // Activity metrics
  metrics: {
    performance: Record<ActivityType, {
      average: number;
      best: number;
      recent: number[];
    }>;
    frequency: Record<ActivityType, number>;
    preferences: Record<ActivityType, ActivityPreferences>;
  };

  // Actions
  setActivity: (activity: ActivityType) => void;
  updatePreferences: (prefs: Partial<ActivityPreferences>) => void;
  updateConstraints: (constraints: Partial<ActivityConstraints>) => void;
  logActivity: (activity: ActivityType, duration: number) => void;
  updateMetrics: (activity: ActivityType, performance: number) => void;
  resetActivity: () => void;
}

export const useActivityStore = create<ActivityState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        currentActivity: null,
        preferences: {
          difficulty: 'moderate',
          terrain: ['paved', 'trail'],
          timeOfDay: 'any',
          weather: ['clear', 'cloudy']
        },
        constraints: {
          maxDistance: null,
          maxDuration: null,
          maxElevation: null,
          requiredPOIs: []
        },
        history: [],
        metrics: {
          performance: {},
          frequency: {},
          preferences: {}
        },

        // Actions
        setActivity: (activity) => 
          set({ currentActivity: activity }),
        
        updatePreferences: (prefs) =>
          set((state) => ({
            preferences: { ...state.preferences, ...prefs }
          })),
        
        updateConstraints: (constraints) =>
          set((state) => ({
            constraints: { ...state.constraints, ...constraints }
          })),
        
        logActivity: (activity, duration) =>
          set((state) => ({
            history: [
              ...state.history,
              { activity, duration, timestamp: Date.now() }
            ]
          })),
        
        updateMetrics: (activity, performance) =>
          set((state) => {
            const current = state.metrics.performance[activity] || {
              average: 0,
              best: 0,
              recent: []
            };
            
            return {
              metrics: {
                ...state.metrics,
                performance: {
                  ...state.metrics.performance,
                  [activity]: {
                    average: (current.average + performance) / 2,
                    best: Math.max(current.best, performance),
                    recent: [...current.recent.slice(-9), performance]
                  }
                }
              }
            };
          }),
        
        resetActivity: () =>
          set({
            currentActivity: null,
            preferences: {
              difficulty: 'moderate',
              terrain: ['paved', 'trail'],
              timeOfDay: 'any',
              weather: ['clear', 'cloudy']
            }
          })
      }),
      {
        name: 'activity-storage'
      }
    )
  )
); 