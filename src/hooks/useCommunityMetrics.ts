import { useState, useEffect } from 'react';

interface CommunityMetrics {
  activeUsers: number;
  totalRoutes: number;
  sharedRoutes: number;
  topContributors: Array<{
    id: string;
    name: string;
    contributions: number;
  }>;
}

export const useCommunityMetrics = () => {
  const [metrics, setMetrics] = useState<CommunityMetrics>({
    activeUsers: 0,
    totalRoutes: 0,
    sharedRoutes: 0,
    topContributors: [],
  });

  useEffect(() => {
    // Mock metrics data
    setMetrics({
      activeUsers: Math.floor(Math.random() * 1000),
      totalRoutes: Math.floor(Math.random() * 5000),
      sharedRoutes: Math.floor(Math.random() * 2000),
      topContributors: Array.from({ length: 5 }, (_, i) => ({
        id: `user-${i}`,
        name: `User ${i + 1}`,
        contributions: Math.floor(Math.random() * 100),
      })),
    });
  }, []);

  return metrics;
};

export default useCommunityMetrics; 