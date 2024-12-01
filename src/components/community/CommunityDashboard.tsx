import React, { useState, useEffect } from 'react';
import { useCommunityMetrics } from '@/hooks/useCommunityMetrics';
import type { CommunityMetrics, TrendingFeature } from '@/types/community';

interface Props {
  onFeatureSelect: (featureId: string) => void;
  onMetricFilter: (filter: MetricFilter) => void;
}

export const CommunityDashboard: React.FC<Props> = ({
  onFeatureSelect,
  onMetricFilter
}) => {
  const { metrics, getTrendingFeatures, getTopContributors } = useCommunityMetrics();
  const [trendingFeatures, setTrendingFeatures] = useState<TrendingFeature[]>([]);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');

  useEffect(() => {
    getTrendingFeatures(timeRange).then(setTrendingFeatures);
  }, [timeRange]);

  return (
    <div className="community-dashboard">
      <div className="metrics-overview">
        <MetricCard
          title="Active Users"
          value={metrics.activeUsers}
          trend={metrics.userTrend}
        />
        <MetricCard
          title="Total Votes"
          value={metrics.totalVotes}
          trend={metrics.voteTrend}
        />
        <MetricCard
          title="New Features"
          value={metrics.newFeatures}
          trend={metrics.featureTrend}
        />
      </div>

      <div className="trending-features">
        <h3>Trending Features</h3>
        <div className="time-range-selector">
          <button
            onClick={() => setTimeRange('day')}
            className={timeRange === 'day' ? 'active' : ''}
          >
            Today
          </button>
          <button
            onClick={() => setTimeRange('week')}
            className={timeRange === 'week' ? 'active' : ''}
          >
            This Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={timeRange === 'month' ? 'active' : ''}
          >
            This Month
          </button>
        </div>
        <div className="feature-list">
          {trendingFeatures.map(feature => (
            <TrendingFeatureCard
              key={feature.id}
              feature={feature}
              onClick={() => onFeatureSelect(feature.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}; 