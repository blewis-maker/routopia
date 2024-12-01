type EventName = 
  | 'page_view'
  | 'feature_click'
  | 'activity_select'
  | 'search_attempt'
  | 'quick_start'
  | 'error_occurred';

interface AnalyticsEvent {
  name: EventName;
  properties?: Record<string, any>;
  timestamp?: number;
}

export const LandingAnalytics = {
  track: (event: AnalyticsEvent) => {
    try {
      // Replace with your analytics service
      console.log('Analytics Event:', {
        ...event,
        timestamp: event.timestamp || Date.now(),
        page: 'landing'
      });
    } catch (error) {
      console.error('Analytics Error:', error);
    }
  },

  trackPageView: () => {
    LandingAnalytics.track({
      name: 'page_view'
    });
  },

  trackFeatureClick: (featureId: string) => {
    LandingAnalytics.track({
      name: 'feature_click',
      properties: { featureId }
    });
  },

  trackError: (error: Error) => {
    LandingAnalytics.track({
      name: 'error_occurred',
      properties: {
        message: error.message,
        stack: error.stack
      }
    });
  }
}; 