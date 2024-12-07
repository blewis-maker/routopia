import { useState, useEffect } from 'react';

interface VoteAnalytics {
  upvotes: number;
  downvotes: number;
  trend: 'up' | 'down' | 'stable';
  totalVotes: number;
}

export const useVoteAnalytics = (featureId: string) => {
  const [analytics, setAnalytics] = useState<VoteAnalytics>({
    upvotes: 0,
    downvotes: 0,
    trend: 'stable',
    totalVotes: 0,
  });

  useEffect(() => {
    // Mock analytics data
    setAnalytics({
      upvotes: Math.floor(Math.random() * 100),
      downvotes: Math.floor(Math.random() * 50),
      trend: Math.random() > 0.5 ? 'up' : 'down',
      totalVotes: Math.floor(Math.random() * 150),
    });
  }, [featureId]);

  return analytics;
};

export default useVoteAnalytics; 