import { ActivityVariation } from '@/types/activities';

interface UserChoice {
  timestamp: Date;
  activityType: string;
  choice: {
    type: string;
    features: string[];
    conditions?: string[];
  };
  context: {
    weather?: string;
    timeOfDay?: string;
    season?: string;
  };
}

export class PreferenceLearningService {
  private readonly CHOICE_WEIGHT = 0.7;
  private readonly RECENCY_WEIGHT = 0.3;
  private readonly MAX_HISTORY = 50;

  async recordChoice(userId: string, choice: UserChoice) {
    try {
      // Store choice in database
      const choices = await this.getUserChoices(userId);
      choices.push(choice);

      // Trim history if needed
      if (choices.length > this.MAX_HISTORY) {
        choices.shift();
      }

      await this.updateUserChoices(userId, choices);
      await this.updatePreferences(userId, choice);
    } catch (error) {
      console.error('Error recording choice:', error);
    }
  }

  async updatePreferences(userId: string, newChoice: UserChoice) {
    const choices = await this.getUserChoices(userId);
    const preferences = await this.getCurrentPreferences(userId);

    // Calculate preference scores
    const scores = this.calculatePreferenceScores(choices);

    // Update preferences based on scores
    switch (newChoice.activityType) {
      case 'Bike':
        preferences.biking = this.updateBikePreferences(scores);
        break;
      case 'Run':
        preferences.running = this.updateRunPreferences(scores);
        break;
      case 'Ski':
        preferences.skiing = this.updateSkiPreferences(scores);
        break;
    }

    await this.savePreferences(userId, preferences);
  }

  private calculatePreferenceScores(choices: UserChoice[]) {
    const scores: Record<string, number> = {};

    choices.forEach((choice, index) => {
      const recencyScore = (index + 1) / choices.length;
      
      choice.choice.features.forEach(feature => {
        if (!scores[feature]) scores[feature] = 0;
        scores[feature] += this.CHOICE_WEIGHT + (this.RECENCY_WEIGHT * recencyScore);
      });
    });

    return scores;
  }

  // Implementation of database methods would go here
  private async getUserChoices(userId: string): Promise<UserChoice[]> {
    // Implement database fetch
    return [];
  }

  private async getCurrentPreferences(userId: string): Promise<ActivityVariation> {
    // Implement database fetch
    return {};
  }

  private async savePreferences(userId: string, preferences: ActivityVariation) {
    // Implement database save
  }

  private async updateUserChoices(userId: string, choices: UserChoice[]) {
    // Implement database update
  }
} 