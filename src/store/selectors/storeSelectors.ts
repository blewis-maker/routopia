import { useActivityStore } from '../activity/activity.store';
import { useRealTimeStore } from '../realtime/realtime.store';
import { useFeedbackStore } from '../feedback/feedback.store';
import { useMainApplicationStore } from '../app/mainApplication.store';

// Activity Selectors
export const activitySelectors = {
  useCurrentActivity: () => useActivityStore(state => state.currentActivity),
  useActivityMetrics: (activityType: string) => 
    useActivityStore(state => state.metrics.performance[activityType]),
  useRecentActivities: () => 
    useActivityStore(state => state.history.slice(-5)),
  useActivityPreferences: () => 
    useActivityStore(state => state.preferences),
  useActivityConstraints: () => 
    useActivityStore(state => state.constraints)
};

// RealTime Selectors
export const realTimeSelectors = {
  useWeatherData: () => useRealTimeStore(state => state.weather),
  useTrafficData: () => useRealTimeStore(state => state.traffic),
  useConditionsData: () => useRealTimeStore(state => state.conditions),
  useUpdateStatus: () => useRealTimeStore(state => state.updateStatus),
  useLastUpdates: () => useRealTimeStore(state => state.lastUpdate)
};

// Feedback Selectors
export const feedbackSelectors = {
  useActiveAlerts: () => 
    useFeedbackStore(state => state.alerts.filter(alert => !alert.dismissed)),
  useUnreadNotifications: () => 
    useFeedbackStore(state => state.notifications.filter(n => !n.read)),
  useCurrentFeedback: () => 
    useFeedbackStore(state => state.interactionFeedback),
  useFeedbackSettings: () => 
    useFeedbackStore(state => state.settings)
};

// Main Application Selectors
export const mainAppSelectors = {
  useLayoutState: () => useMainApplicationStore(state => state.layout),
  useIntegrationStatus: () => useMainApplicationStore(state => state.integration),
  useActiveView: () => useMainApplicationStore(state => state.layout.activeView),
  usePanelStates: () => ({
    leftPanel: useMainApplicationStore(state => state.layout.leftPanelOpen),
    rightPanel: useMainApplicationStore(state => state.layout.rightPanelOpen)
  })
}; 