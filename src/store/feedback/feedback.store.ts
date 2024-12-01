import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Alert, Notification, InteractionFeedback } from '@/types/feedback.types';

interface FeedbackState {
  // Core state
  alerts: Alert[];
  notifications: Notification[];
  interactionFeedback: InteractionFeedback[];
  
  // Feedback settings
  settings: {
    alertDuration: number;
    notificationDuration: number;
    feedbackTypes: Set<string>;
  };

  // Actions
  addAlert: (alert: Alert) => void;
  dismissAlert: (alertId: string) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => void;
  addFeedback: (feedback: InteractionFeedback) => void;
  clearFeedback: (feedbackId: string) => void;
  updateSettings: (settings: Partial<FeedbackState['settings']>) => void;
  clearAll: () => void;
}

export const useFeedbackStore = create<FeedbackState>()(
  devtools(
    (set) => ({
      // Initial state
      alerts: [],
      notifications: [],
      interactionFeedback: [],
      settings: {
        alertDuration: 5000,
        notificationDuration: 7000,
        feedbackTypes: new Set(['success', 'error', 'warning', 'info'])
      },

      // Actions
      addAlert: (alert) =>
        set((state) => ({
          alerts: [...state.alerts, alert]
        })),

      dismissAlert: (alertId) =>
        set((state) => ({
          alerts: state.alerts.filter(alert => alert.id !== alertId)
        })),

      addNotification: (notification) =>
        set((state) => ({
          notifications: [...state.notifications, notification]
        })),

      markAsRead: (notificationId) =>
        set((state) => ({
          notifications: state.notifications.map(notif =>
            notif.id === notificationId
              ? { ...notif, read: true }
              : notif
          )
        })),

      addFeedback: (feedback) =>
        set((state) => ({
          interactionFeedback: [...state.interactionFeedback, feedback]
        })),

      clearFeedback: (feedbackId) =>
        set((state) => ({
          interactionFeedback: state.interactionFeedback.filter(
            feedback => feedback.id !== feedbackId
          )
        })),

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ...newSettings
          }
        })),

      clearAll: () =>
        set({
          alerts: [],
          notifications: [],
          interactionFeedback: []
        })
    })
  )
); 