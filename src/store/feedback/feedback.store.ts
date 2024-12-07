import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface FeedbackState {
  alerts: Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>;
  notifications: Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>;
  interactionFeedback: Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>;
  addAlert: (alert: { message: string; type: 'success' | 'error' | 'info' | 'warning' }) => void;
  addNotification: (notification: { message: string; type: 'success' | 'error' | 'info' | 'warning' }) => void;
  addFeedback: (feedback: { message: string; type: 'success' | 'error' | 'info' | 'warning' }) => void;
  clearAlerts: () => void;
  clearNotifications: () => void;
  clearFeedback: () => void;
}

export const useFeedbackStore = create<FeedbackState>()(
  devtools(
    (set) => ({
      alerts: [],
      notifications: [],
      interactionFeedback: [],
      addAlert: (alert) =>
        set((state) => ({
          alerts: [...state.alerts, { ...alert, id: Math.random().toString() }],
        })),
      addNotification: (notification) =>
        set((state) => ({
          notifications: [...state.notifications, { ...notification, id: Math.random().toString() }],
        })),
      addFeedback: (feedback) =>
        set((state) => ({
          interactionFeedback: [...state.interactionFeedback, { ...feedback, id: Math.random().toString() }],
        })),
      clearAlerts: () => set({ alerts: [] }),
      clearNotifications: () => set({ notifications: [] }),
      clearFeedback: () => set({ interactionFeedback: [] }),
    }),
    { name: 'feedback-store' }
  )
); 