import { useActivityStore } from '../activity/activity.store';
import { useRealTimeStore } from '../realtime/realtime.store';
import { useFeedbackStore } from '../feedback/feedback.store';
import { useMainApplicationStore } from '../app/mainApplication.store';

export const storeIntegration = {
  // Cross-store actions
  actions: {
    async updateActivityWithConditions() {
      const weather = useRealTimeStore.getState().weather;
      const activity = useActivityStore.getState().currentActivity;
      
      if (weather && activity) {
        await useActivityStore.getState().updatePreferences({
          weather: [weather.currentCondition]
        });
      }
    },

    async handleActivityChange(newActivity: string) {
      // Update activity
      await useActivityStore.getState().setActivity(newActivity);
      
      // Refresh real-time data
      await useRealTimeStore.getState().updateAll();
      
      // Show feedback
      useFeedbackStore.getState().addNotification({
        id: Date.now().toString(),
        type: 'info',
        message: `Switched to ${newActivity} mode`
      });
    },

    async handleError(error: Error) {
      // Log error
      console.error(error);
      
      // Show feedback
      useFeedbackStore.getState().addAlert({
        id: Date.now().toString(),
        type: 'error',
        message: error.message
      });
      
      // Update application state
      useMainApplicationStore.getState().setActiveView('map');
    }
  },

  // Store synchronization
  sync: {
    async syncAllStores() {
      await Promise.all([
        useActivityStore.getState().resetActivity(),
        useRealTimeStore.getState().resetUpdates(),
        useFeedbackStore.getState().clearAll()
      ]);
    },

    async syncActivityWithRealTime() {
      const activity = useActivityStore.getState().currentActivity;
      if (activity) {
        await useRealTimeStore.getState().updateAll();
      }
    }
  }
}; 