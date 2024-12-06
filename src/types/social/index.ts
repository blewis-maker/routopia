export interface SocialFactors {
  popularTimes: Array<{
    hour: number;
    crowdLevel: number;
  }>;
  userRatings: {
    safety: number;
    scenery: number;
    difficulty: number;
    facilities: number;
  };
  recentActivity: {
    lastHour: number;
    lastDay: number;
  };
  communityEvents?: {
    upcoming: Array<{
      type: string;
      participants: number;
      date: string;
    }>;
    ongoing: Array<{
      type: string;
      participants: number;
      endTime: string;
    }>;
  };
  socialGroups?: Array<{
    id: string;
    name: string;
    members: number;
    activityTypes: string[];
    privacy: 'public' | 'private' | 'invite-only';
  }>;
  userInteractions?: {
    likes: number;
    shares: number;
    comments: number;
    follows: number;
  };
  safetyReports?: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    timestamp: string;
    resolved: boolean;
  }>;
} 