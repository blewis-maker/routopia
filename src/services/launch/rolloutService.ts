export class RolloutService {
  private readonly ROLLOUT_PHASES = [
    { name: 'internal', percentage: 5 },
    { name: 'beta', percentage: 15 },
    { name: 'general', percentage: 100 }
  ];

  private currentPhase = 0;
  private activeUsers = new Set<string>();

  async initiateRollout(): Promise<void> {
    await this.validatePreRequisites();
    await this.startPhase(0);
  }

  async progressToNextPhase(): Promise<void> {
    if (this.currentPhase >= this.ROLLOUT_PHASES.length - 1) {
      throw new Error('Rollout already completed');
    }

    const currentMetrics = await this.evaluateCurrentPhase();
    if (!this.isPhaseSuccessful(currentMetrics)) {
      throw new Error('Current phase metrics do not meet requirements');
    }

    await this.startPhase(this.currentPhase + 1);
  }

  isUserAllowed(userId: string): boolean {
    if (this.activeUsers.has(userId)) {
      return true;
    }

    const userHash = this.hashUser(userId);
    const currentPercentage = this.ROLLOUT_PHASES[this.currentPhase].percentage;
    
    const isAllowed = (userHash % 100) < currentPercentage;
    if (isAllowed) {
      this.activeUsers.add(userId);
    }

    return isAllowed;
  }

  private async startPhase(phase: number): Promise<void> {
    this.currentPhase = phase;
    const { name, percentage } = this.ROLLOUT_PHASES[phase];

    await analytics.trackRolloutPhase({
      phase: name,
      percentage,
      timestamp: new Date().toISOString()
    });
  }

  private hashUser(userId: string): number {
    // Simple hash function for demonstration
    return Array.from(userId).reduce(
      (hash, char) => ((hash << 5) - hash) + char.charCodeAt(0),
      0
    ) % 100;
  }
} 