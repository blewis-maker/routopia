import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { useActivityStore } from '../activity/activity.store';
import { useRealTimeStore } from '../realtime/realtime.store';
import { useFeedbackStore } from '../feedback/feedback.store';

interface MainApplicationState {
  // Layout state
  layout: {
    leftPanelOpen: boolean;
    rightPanelOpen: boolean;
    activeView: 'map' | 'list' | 'metrics';
  };

  // Integration state
  integration: {
    activityReady: boolean;
    realTimeReady: boolean;
    feedbackReady: boolean;
  };

  // Actions
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  setActiveView: (view: MainApplicationState['layout']['activeView']) => void;
  initializeIntegration: () => Promise<void>;
  resetApplication: () => void;
}

export const useMainApplicationStore = create<MainApplicationState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        layout: {
          leftPanelOpen: true,
          rightPanelOpen: true,
          activeView: 'map'
        },
        integration: {
          activityReady: false,
          realTimeReady: false,
          feedbackReady: false
        },

        // Actions
        toggleLeftPanel: () =>
          set((state) => ({
            layout: {
              ...state.layout,
              leftPanelOpen: !state.layout.leftPanelOpen
            }
          })),

        toggleRightPanel: () =>
          set((state) => ({
            layout: {
              ...state.layout,
              rightPanelOpen: !state.layout.rightPanelOpen
            }
          })),

        setActiveView: (view) =>
          set((state) => ({
            layout: {
              ...state.layout,
              activeView: view
            }
          })),

        initializeIntegration: async () => {
          try {
            // Initialize stores
            await Promise.all([
              useActivityStore.getState().resetActivity(),
              useRealTimeStore.getState().resetUpdates(),
              useFeedbackStore.getState().clearAll()
            ]);

            set({
              integration: {
                activityReady: true,
                realTimeReady: true,
                feedbackReady: true
              }
            });
          } catch (error) {
            console.error('Error initializing integration:', error);
          }
        },

        resetApplication: () =>
          set({
            layout: {
              leftPanelOpen: true,
              rightPanelOpen: true,
              activeView: 'map'
            },
            integration: {
              activityReady: false,
              realTimeReady: false,
              feedbackReady: false
            }
          })
      }),
      {
        name: 'main-application-storage'
      }
    )
  )
); 