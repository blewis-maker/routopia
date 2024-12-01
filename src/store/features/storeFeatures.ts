import { useActivityStore } from '../activity/activity.store';
import { useRealTimeStore } from '../realtime/realtime.store';
import { useFeedbackStore } from '../feedback/feedback.store';
import { useMainApplicationStore } from '../app/mainApplication.store';

export const storeFeatures = {
  // Activity features
  activity: {
    async analyzeActivityPattern() {
      const history = useActivityStore.getState().history;
      return {
        mostFrequent: findMostFrequentActivity(history),
        bestPerformance: calculateBestPerformance(history),
        recommendations: generateRecommendations(history)
      };
    },

    async optimizePreferences() {
      const preferences = useActivityStore.getState().preferences;
      const metrics = useActivityStore.getState().metrics;
      return generateOptimizedPreferences(preferences, metrics);
    }
  },

  // RealTime features
  realTime: {
    async predictConditions() {
      const weather = useRealTimeStore.getState().weather;
      const traffic = useRealTimeStore.getState().traffic;
      return generatePredictions(weather, traffic);
    },

    async optimizeUpdateSchedule() {
      const lastUpdate = useRealTimeStore.getState().lastUpdate;
      return calculateOptimalUpdateInterval(lastUpdate);
    }
  },

  // Feedback features
  feedback: {
    async analyzeFeedbackPatterns() {
      const feedback = useFeedbackStore.getState().interactionFeedback;
      return {
        commonIssues: identifyCommonIssues(feedback),
        userSentiment: analyzeSentiment(feedback),
        suggestions: generateSuggestions(feedback)
      };
    },

    async optimizeAlertTiming() {
      const alerts = useFeedbackStore.getState().alerts;
      return calculateOptimalAlertTiming(alerts);
    }
  }
}; 