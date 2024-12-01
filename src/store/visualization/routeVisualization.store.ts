import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { RouteVisualizationSchema } from '@/schemas/visualization/RouteVisualization';

interface RouteVisualizationState {
  // Core state
  currentRoute: RouteVisualizationSchema['route'] | null;
  activeOverlays: Set<keyof RouteVisualizationSchema['overlays']>;
  interactionState: {
    hoveredElement: string | null;
    selectedElement: string | null;
    dragState: {
      active: boolean;
      startPosition: { lat: number; lng: number } | null;
    };
  };
  
  // Performance tracking
  performance: {
    lastUpdateTimestamp: number;
    frameRate: number;
    renderTime: number;
  };
  
  // Actions
  setRoute: (route: RouteVisualizationSchema['route']) => void;
  toggleOverlay: (overlay: keyof RouteVisualizationSchema['overlays']) => void;
  updateInteractionState: (update: Partial<RouteVisualizationState['interactionState']>) => void;
  resetState: () => void;
}

export const useRouteVisualizationStore = create<RouteVisualizationState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        currentRoute: null,
        activeOverlays: new Set(),
        interactionState: {
          hoveredElement: null,
          selectedElement: null,
          dragState: {
            active: false,
            startPosition: null
          }
        },
        performance: {
          lastUpdateTimestamp: Date.now(),
          frameRate: 60,
          renderTime: 0
        },
        
        // Actions
        setRoute: (route) => set({ currentRoute: route }),
        toggleOverlay: (overlay) => 
          set((state) => {
            const newOverlays = new Set(state.activeOverlays);
            if (newOverlays.has(overlay)) {
              newOverlays.delete(overlay);
            } else {
              newOverlays.add(overlay);
            }
            return { activeOverlays: newOverlays };
          }),
        updateInteractionState: (update) =>
          set((state) => ({
            interactionState: { ...state.interactionState, ...update }
          })),
        resetState: () => set({
          currentRoute: null,
          activeOverlays: new Set(),
          interactionState: {
            hoveredElement: null,
            selectedElement: null,
            dragState: { active: false, startPosition: null }
          }
        })
      }),
      {
        name: 'route-visualization-storage'
      }
    )
  )
); 