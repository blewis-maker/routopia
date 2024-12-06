import { CrossActivityLearningService } from '@/services/ai/CrossActivityLearningService';
import { ContextualLearningService } from '@/services/ai/ContextualLearningService';
import { SocialLearningService } from '@/services/ai/SocialLearningService';
import { ActivityType } from '@/types/activity';
import { LearningPattern } from '@/types/ai/learning';
import { GeoPoint } from '@/types/geo';

export class MockCrossActivityLearningService extends CrossActivityLearningService {
  private mockPatterns: Map<string, LearningPattern[]> = new Map();

  setMockPatterns(patterns: Map<string, LearningPattern[]>) {
    this.mockPatterns = patterns;
  }

  async analyzeActivityPatterns() {
    return this.mockPatterns;
  }
}

export class MockContextualLearningService extends ContextualLearningService {
  private mockPatterns: {
    seasonalPatterns: LearningPattern[];
    environmentalPatterns: LearningPattern[];
    adaptationSuggestions: string[];
  } = {
    seasonalPatterns: [],
    environmentalPatterns: [],
    adaptationSuggestions: []
  };

  setMockPatterns(patterns: {
    seasonalPatterns: LearningPattern[];
    environmentalPatterns: LearningPattern[];
    adaptationSuggestions: string[];
  }) {
    this.mockPatterns = patterns;
  }

  async analyzeContextualPatterns() {
    return this.mockPatterns;
  }
}

export class MockSocialLearningService extends SocialLearningService {
  private mockPatterns: {
    groupPatterns: LearningPattern[];
    communityPatterns: LearningPattern[];
    socialRecommendations: string[];
  } = {
    groupPatterns: [],
    communityPatterns: [],
    socialRecommendations: []
  };

  setMockPatterns(patterns: {
    groupPatterns: LearningPattern[];
    communityPatterns: LearningPattern[];
    socialRecommendations: string[];
  }) {
    this.mockPatterns = patterns;
  }

  async analyzeSocialPatterns() {
    return this.mockPatterns;
  }
}

export const createMockPattern = (
  type: string,
  confidence: number,
  pattern: any,
  relatedActivities?: ActivityType[]
): LearningPattern => ({
  type: type as any,
  confidence,
  pattern,
  relatedActivities
});

export const createMockPatterns = () => {
  const crossActivityPatterns = new Map<string, LearningPattern[]>();
  crossActivityPatterns.set('WALK', [
    createMockPattern('performance', 0.8, {
      intensity: 5,
      duration: 1800,
      elevation: { gain: 100, loss: 50 }
    }),
    createMockPattern('cross_activity', 0.7, {
      transferableSkills: ['RUN', 'BIKE']
    }, ['RUN', 'BIKE'])
  ]);

  const contextualPatterns = {
    seasonalPatterns: [
      createMockPattern('seasonal_activity', 0.85, {
        season: 'summer',
        daylight: { duration: 14 },
        performance: { efficiency: 0.9 }
      })
    ],
    environmentalPatterns: [
      createMockPattern('environmental_impact', 0.75, {
        temperature: { preferred: 20, range: [15, 25] },
        conditions: ['clear', 'partly_cloudy']
      })
    ],
    adaptationSuggestions: [
      'Consider early morning activities during summer',
      'Optimal conditions for outdoor activities'
    ]
  };

  const socialPatterns = {
    groupPatterns: [
      createMockPattern('group_interaction', 0.8, {
        size: 3,
        coordination: 0.9,
        satisfaction: 0.85
      })
    ],
    communityPatterns: [
      createMockPattern('community_influence', 0.7, {
        influence: 0.6,
        engagement: 0.8,
        feedback: { positive: 0.9 }
      })
    ],
    socialRecommendations: [
      'Join the morning running group',
      'Participate in weekend community events'
    ]
  };

  return {
    crossActivityPatterns,
    contextualPatterns,
    socialPatterns
  };
}; 