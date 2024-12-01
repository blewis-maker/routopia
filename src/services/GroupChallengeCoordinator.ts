import type { 
  GroupChallenge, 
  TeamFormation, 
  ChallengeMetrics,
  RewardSystem 
} from '@/types/challenges';

export class GroupChallengeCoordinator {
  private teamBuilder: TeamBuilder;
  private challengeDesigner: ChallengeDesigner;
  private rewardManager: RewardManager;

  async createGroupChallenge(params: {
    type: ChallengeType;
    difficulty: DifficultyLevel;
    teamSize: number;
    duration: Duration;
  }): Promise<GroupChallenge> {
    const teams = await this.formTeams(params);
    const challenge = this.designChallenge(params, teams);

    return {
      id: generateId(),
      type: params.type,
      teams: teams,
      objectives: this.defineObjectives(params),
      rewards: this.setupRewards(params),
      progressTracking: this.initializeTracking(teams),
      communications: this.setupCommunicationChannels(teams),
      leaderboard: this.createLeaderboard(teams)
    };
  }

  private async formTeams(
    params: ChallengeParams
  ): Promise<TeamFormation[]> {
    return this.teamBuilder.createBalancedTeams({
      size: params.teamSize,
      skillLevel: params.difficulty,
      activityPreferences: params.type
    });
  }

  async updateChallengeProgress(
    challengeId: string,
    teamId: string,
    progress: Progress
  ): Promise<ChallengeStatus> {
    return this.challengeDesigner.updateProgress(challengeId, teamId, progress);
  }
} 