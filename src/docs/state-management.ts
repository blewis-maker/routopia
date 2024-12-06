// Global State Management
interface StateArchitecture {
  stores: {
    // User Context & Preferences
    userStore: {
      state: {
        user: User | null;
        preferences: UserPreferences;
        settings: AppSettings;
      };
      actions: {
        updatePreferences: (prefs: Partial<UserPreferences>) => void;
        updateSettings: (settings: Partial<AppSettings>) => void;
        logout: () => Promise<void>;
      };
    };

    // Route & Navigation
    routeStore: {
      state: {
        currentRoute: Route | null;
        waypoints: Waypoint[];
        activeActivity: ActivityType;
      };
      actions: {
        setRoute: (route: Route) => void;
        updateWaypoints: (waypoints: Waypoint[]) => void;
        optimizeRoute: () => Promise<Route>;
      };
    };

    // Real-time Updates
    realtimeStore: {
      state: {
        weather: WeatherData | null;
        traffic: TrafficData | null;
        alerts: Alert[];
      };
      actions: {
        updateWeather: (data: WeatherData) => void;
        updateTraffic: (data: TrafficData) => void;
        addAlert: (alert: Alert) => void;
      };
    };

    // UI State
    uiStore: {
      state: {
        theme: 'light' | 'dark';
        sidebarOpen: boolean;
        activeModal: string | null;
      };
      actions: {
        toggleTheme: () => void;
        toggleSidebar: () => void;
        setModal: (modalId: string | null) => void;
      };
    };
  };

  // State Persistence Strategy
  persistence: {
    local: ['theme', 'preferences'];
    session: ['currentRoute', 'waypoints'];
    memory: ['weather', 'traffic'];
  };

  // Real-time Sync Strategy
  sync: {
    websocket: ['alerts', 'traffic'];
    polling: ['weather'];
    manual: ['routes', 'preferences'];
  };
}

// Implementation using modern patterns
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      preferences: {},
      setUser: (user: User) => set({ user }),
      updatePreferences: (prefs: Partial<UserPreferences>) =>
        set((state) => ({
          preferences: { ...state.preferences, ...prefs },
        })),
    }),
    {
      name: 'user-store',
    }
  )
);

export const useRouteStore = create((set) => ({
  currentRoute: null,
  waypoints: [],
  setRoute: (route: Route) => set({ currentRoute: route }),
  updateWaypoints: (waypoints: Waypoint[]) => set({ waypoints }),
}));
