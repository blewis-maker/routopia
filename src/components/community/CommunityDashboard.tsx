import React from 'react';
import { MetricCard } from './MetricCard';

interface CommunityDashboardProps {
  onFeatureSelect?: (featureId: string) => void;
  onMetricFilter?: (filter: { type: string; value: string }) => void;
}

export const CommunityDashboard: React.FC<CommunityDashboardProps> = ({
  onFeatureSelect,
  onMetricFilter,
}) => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Community Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Active Users"
          value="1,234"
          trend={{ value: 12, direction: 'up' }}
        />
        <MetricCard
          title="Routes Shared"
          value="456"
          trend={{ value: 8, direction: 'up' }}
        />
        <MetricCard
          title="Community Rating"
          value="4.8"
          trend={{ value: 2, direction: 'up' }}
        />
      </div>
    </div>
  );
};

export default CommunityDashboard; 