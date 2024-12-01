import type { 
  Reward, 
  Achievement, 
  Milestone,
  ProgressTracker 
} from '@/types/rewards';

export class AdvancedRewards {
  private progressTracker: ProgressTracker;
  private achievementSystem: AchievementSystem;

  async processCompletion(
    userId: string,
    challengeData: ChallengeCompletion
  ): Promise<RewardSummary> {
    // Track user's progress
    const progress = await this.progressTracker.update(userId, challengeData);
    
    // Calculate rewards
    const rewards = await this.calculateRewards(challengeData, progress);
    
    // Check for achievements and milestones
    const achievements = await this.achievementSystem.checkAchievements(
      userId,
      challengeData
    );

    // Apply special bonuses
    const bonuses = this.calculateBonuses(challengeData, progress);

    // Generate reward summary
    return {
      baseRewards: rewards,
      achievements,
      bonuses,
      progressUpdates: progress.updates,
      nextMilestones: await this.getNextMilestones(userId)
    };
  }

  private async calculateRewards(
    completion: ChallengeCompletion,
    progress: UserProgress
  ): Promise<Reward[]> {
    const baseRewards = this.getBaseRewards(completion);
    const streakBonus = this.calculateStreakBonus(progress);
    const difficultyBonus = this.calculateDifficultyBonus(completion);
    
    return this.combineRewards([baseRewards, streakBonus, difficultyBonus]);
  }
} 