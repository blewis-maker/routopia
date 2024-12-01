import { useActivityStore } from '../activity/activity.store';
import { useRealTimeStore } from '../realtime/realtime.store';
import { useFeedbackStore } from '../feedback/feedback.store';
import { useMainApplicationStore } from '../app/mainApplication.store';

export const storeActions = {
  // Composite actions
  async initializeApplication() {
    try {
      // Reset all stores
      await storeIntegration.sync.syncAllStores();
      
      // Initialize features
      await Promise.all([
        storeFeatures.activity.analyzeActivityPattern(),
        storeFeatures.realTime.predictConditions(),
        storeFeatures.feedback.optimizeAlertTiming()
      ]);
      
      // Update application state
      useMainApplicationStore.getState().setActiveView('map');
      
      // Show success feedback
      useFeedbackStore.getState().addNotification({
        id: Date.now().toString(),
        type: 'success',
        message: 'Application initialized successfully'
      });
    } catch (error) {
      storeIntegration.actions.handleError(error as Error);
    }
  },

  async handleUserInteraction(interaction: UserInteraction) {
    try {
      // Update activity if needed
      if (interaction.type === 'activity') {
        await storeIntegration.actions.handleActivityChange(interaction.activity);
      }
      
      // Update real-time data
      await storeIntegration.sync.syncActivityWithRealTime();
      
      // Show feedback
      useFeedbackStore.getState().addFeedback({
        id: Date.now().toString(),
        type: 'success',
        interaction: interaction.type
      });
    } catch (error) {
      storeIntegration.actions.handleError(error as Error);
    }
  },

  async optimizeApplication() {
    try {
      // Optimize all features
      const [
        activityOptimization,
        realTimeOptimization,
        feedbackOptimization
      ] = await Promise.all([
        storeFeatures.activity.optimizePreferences(),
        storeFeatures.realTime.optimizeUpdateSchedule(),
        storeFeatures.feedback.optimizeAlertTiming()
      ]);
      
      // Apply optimizations
      await Promise.all([
        useActivityStore.getState().updatePreferences(activityOptimization),
        useRealTimeStore.getState().updateSettings(realTimeOptimization),
        useFeedbackStore.getState().updateSettings(feedbackOptimization)
      ]);
    } catch (error) {
      storeIntegration.actions.handleError(error as Error);
    }
  }
}; 