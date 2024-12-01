export type ChallengeType = 
  | 'route_completion'    // Complete specific routes
  | 'distance_milestone'  // Cover total distance
  | 'elevation_gain'      // Achieve elevation goals
  | 'poi_explorer'        // Visit specific POIs
  | 'weather_warrior'     // Complete in specific conditions
  | 'time_trial'          // Speed-based challenges
  | 'multi_activity'      // Combine different activities
  | 'social_group';       // Group-based challenges

export interface ChallengeDefinition {
  type: ChallengeType;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration: number; // in days
  requirements: ChallengeRequirements;
  rewards: ChallengeRewards;
  socialFeatures: SocialFeatures;
} 