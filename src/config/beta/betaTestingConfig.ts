export const betaTestingConfig = {
  // Feature flags for beta features
  features: {
    enhancedRouting: {
      enabled: true,
      rolloutPercentage: 50,
      fallback: 'standardRouting'
    },
    aiSuggestions: {
      enabled: true,
      rolloutPercentage: 25,
      fallback: 'staticSuggestions'
    },
    realTimeUpdates: {
      enabled: true,
      rolloutPercentage: 75,
      fallback: 'periodicUpdates'
    }
  },

  // Beta user management
  userGroups: {
    earlyAccess: {
      maxUsers: 1000,
      features: ['enhancedRouting', 'aiSuggestions'],
      feedbackPriority: 'high'
    },
    generalBeta: {
      maxUsers: 5000,
      features: ['enhancedRouting'],
      feedbackPriority: 'medium'
    }
  },

  // Feedback collection
  feedback: {
    autoPrompt: true,
    promptDelay: 300000, // 5 minutes
    categories: [
      'routing',
      'interface',
      'performance',
      'suggestions'
    ],
    channels: [
      'in-app',
      'email',
      'survey'
    ]
  }
}; 