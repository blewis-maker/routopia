import { betaTestingConfig } from '../../config/beta/betaTestingConfig';
import { analytics } from '../analytics/analyticsService';
import { feedback } from '../feedback/feedbackService';

export class BetaTestingService {
  private activeFeatures: Map<string, boolean> = new Map();
  private userGroup: string | null = null;

  async initialize(userId: string) {
    // Determine user group
    this.userGroup = await this.assignUserGroup(userId);
    
    // Initialize feature flags
    await this.initializeFeatures();
    
    // Setup feedback collection
    this.setupFeedbackCollection();
    
    // Start monitoring
    this.startMonitoring();
  }

  private async assignUserGroup(userId: string): Promise<string> {
    const groups = betaTestingConfig.userGroups;
    
    // Check existing assignments
    const existingGroup = await this.getUserGroup(userId);
    if (existingGroup) return existingGroup;
    
    // Assign to group based on capacity
    for (const [group, config] of Object.entries(groups)) {
      const currentUsers = await this.getGroupUserCount(group);
      if (currentUsers < config.maxUsers) {
        await this.assignToGroup(userId, group);
        return group;
      }
    }
    
    return 'generalBeta'; // Default group
  }

  private async initializeFeatures() {
    const { features } = betaTestingConfig;
    
    for (const [feature, config] of Object.entries(features)) {
      const isEnabled = this.shouldEnableFeature(feature, config);
      this.activeFeatures.set(feature, isEnabled);
    }
  }

  private setupFeedbackCollection() {
    const { feedback: feedbackConfig } = betaTestingConfig;
    
    if (feedbackConfig.autoPrompt) {
      setTimeout(() => {
        this.promptForFeedback();
      }, feedbackConfig.promptDelay);
    }
  }

  private startMonitoring() {
    // Monitor feature usage
    analytics.trackFeatureUsage(Array.from(this.activeFeatures.keys()));
    
    // Monitor performance
    analytics.trackPerformanceMetrics();
    
    // Monitor errors
    analytics.trackErrors();
  }

  // Public methods for feature checks
  isFeatureEnabled(feature: string): boolean {
    return this.activeFeatures.get(feature) ?? false;
  }

  async submitFeedback(feedback: BetaFeedback) {
    return await this.processFeedback(feedback);
  }
} 