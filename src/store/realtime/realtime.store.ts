import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { WeatherData, TrafficData, ConditionData } from '@/types/realtime.types';

interface RealTimeState {
  // Core state
  weather: WeatherData | null;
  traffic: TrafficData | null;
  conditions: ConditionData | null;
  lastUpdate: {
    weather: number;
    traffic: number;
    conditions: number;
  };

  // Update tracking
  updateStatus: {
    inProgress: boolean;
    lastError: Error | null;
    retryCount: number;
  };

  // Actions
  updateWeather: (data: WeatherData) => void;
  updateTraffic: (data: TrafficData) => void;
  updateConditions: (data: ConditionData) => void;
  updateAll: () => Promise<void>;
  handleUpdateError: (error: Error) => void;
  resetUpdates: () => void;
}

export const useRealTimeStore = create<RealTimeState>()(
  devtools(
    (set, get) => ({
      // Initial state
      weather: null,
      traffic: null,
      conditions: null,
      lastUpdate: {
        weather: 0,
        traffic: 0,
        conditions: 0
      },
      updateStatus: {
        inProgress: false,
        lastError: null,
        retryCount: 0
      },

      // Actions
      updateWeather: (data) =>
        set((state) => ({
          weather: data,
          lastUpdate: {
            ...state.lastUpdate,
            weather: Date.now()
          }
        })),

      updateTraffic: (data) =>
        set((state) => ({
          traffic: data,
          lastUpdate: {
            ...state.lastUpdate,
            traffic: Date.now()
          }
        })),

      updateConditions: (data) =>
        set((state) => ({
          conditions: data,
          lastUpdate: {
            ...state.lastUpdate,
            conditions: Date.now()
          }
        })),

      updateAll: async () => {
        set({ updateStatus: { ...get().updateStatus, inProgress: true } });
        try {
          const [weather, traffic, conditions] = await Promise.all([
            fetchWeatherData(),
            fetchTrafficData(),
            fetchConditionData()
          ]);
          
          set((state) => ({
            weather,
            traffic,
            conditions,
            lastUpdate: {
              weather: Date.now(),
              traffic: Date.now(),
              conditions: Date.now()
            },
            updateStatus: {
              inProgress: false,
              lastError: null,
              retryCount: 0
            }
          }));
        } catch (error) {
          get().handleUpdateError(error as Error);
        }
      },

      handleUpdateError: (error) =>
        set((state) => ({
          updateStatus: {
            inProgress: false,
            lastError: error,
            retryCount: state.updateStatus.retryCount + 1
          }
        })),

      resetUpdates: () =>
        set({
          weather: null,
          traffic: null,
          conditions: null,
          lastUpdate: {
            weather: 0,
            traffic: 0,
            conditions: 0
          },
          updateStatus: {
            inProgress: false,
            lastError: null,
            retryCount: 0
          }
        })
    })
  )
); 