import { useActivityStore } from '../activity/activity.store';
import { useRealTimeStore } from '../realtime/realtime.store';
import { useFeedbackStore } from '../feedback/feedback.store';
import { useMainApplicationStore } from '../app/mainApplication.store';

export const appStateIntegration = {
  // Initialize all stores
  async initializeApp() {
    try {
      // Start loading
      useMainApplicationStore.getState().setLoading(true);

      // Initialize stores in parallel
      await Promise.all([
        useActivityStore.getState().initialize(),
        useRealTimeStore.getState().initialize(),
        useFeedbackStore.getState().initialize()
      ]);

      // Update integration status
      useMainApplicationStore.getState().setIntegrationStatus({
        activityReady: true,
        realTimeReady: true,
        feedbackReady: true
      });

    } catch (error) {
      useFeedbackStore.getState().addAlert({
        type: 'error',
        message: 'Failed to initialize application'
      });
    } finally {
      useMainApplicationStore.getState().setLoading(false);
    }
  },

  // Sync states between stores
  setupStoreSync() {
    // Sync activity with real-time
    useActivityStore.subscribe((state) => {
      if (state.currentActivity) {
        useRealTimeStore.getState().updateForActivity(state.currentActivity);
      }
    });

    // Sync real-time with feedback
    useRealTimeStore.subscribe((state) => {
      if (state.updateStatus.lastError) {
        useFeedbackStore.getState().addAlert({
          type: 'error',
          message: 'Real-time update failed'
        });
      }
    });
  }
}; 