import { useState, useEffect } from 'react';
import { useActivityStore } from '@/store/activity/activity.store';
import type { ActivityType, ActivityStats, ActivityMetrics } from '@/types/activity';

export function ActivityOverview() {
  const store = useActivityStore();
  const [stats, setStats] = useState<ActivityStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const activityStats = await store.getActivityStats();
        setStats(activityStats);
      } catch (error) {
        console.error('Failed to load activity stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [store]);

  if (loading) {
    return <div>Loading activity stats...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <div key={stat.type} className="p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold">{stat.type}</h3>
          <div className="mt-2 space-y-2">
            <p>Total Activities: {stat.count}</p>
            <p>Total Distance: {(stat.totalDistance / 1000).toFixed(1)} km</p>
            <p>Total Duration: {Math.round(stat.totalDuration / 60)} minutes</p>
            <p>Average Speed: {stat.averageSpeed.toFixed(1)} km/h</p>
            {stat.lastActivity && (
              <div className="mt-4">
                <h4 className="font-medium">Last Activity</h4>
                <p>Date: {new Date(stat.lastActivity.date).toLocaleDateString()}</p>
                <p>Distance: {(stat.lastActivity.metrics.distance / 1000).toFixed(1)} km</p>
                <p>Duration: {Math.round(stat.lastActivity.metrics.duration / 60)} minutes</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
 