import type { Achievement, Reward, UserProgress } from '@/types/rewards';

export class ChallengeRewards {
  private achievements: Map<string, Achievement> = new Map();
  private userProgress: Map<string, UserProgress> = new Map();

  async grantReward(userId: string, challengeId: string, completion: CompletionData): Promise<Reward[]> {
    const rewards: Reward[] = [];

    // Calculate base rewards
    const baseReward = this.calculateBaseReward(completion);
    rewards.push(baseReward);

    // Check for achievements
    const newAchievements = await this.checkAchievements(userId, completion);
    rewards.push(...newAchievements.map(a => a.reward));

    // Apply multipliers (streaks, difficulty, weather conditions)
    const finalRewards = this.applyMultipliers(rewards, completion);

    // Update user progress
    await this.updateUserProgress(userId, finalRewards);

    return finalRewards;
  }

  private calculateBaseReward(completion: CompletionData): Reward {
    return {
      type: 'points',
      amount: Math.floor(
        completion.distance * 0.1 +
        completion.elevationGain * 0.2 +
        (completion.weatherDifficulty || 1) * 50
      ),
      metadata: {
        difficulty: completion.difficulty,
        conditions: completion.conditions
      }
    };
  }

  private async checkAchievements(
    userId: string, 
    completion: CompletionData
  ): Promise<Achievement[]> {
    const userStats = await this.getUserStats(userId);
    return Array.from(this.achievements.values())
      .filter(achievement => 
        this.hasUnlockedAchievement(achievement, userStats, completion)
      );
  }
} 