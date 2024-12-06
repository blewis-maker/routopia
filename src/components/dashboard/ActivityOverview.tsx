import { useState, useEffect } from 'react';
import { useActivityStore } from '@/store/activity/activity.store';
import type { ActivityType, ActivityStats } from '@/types/activity';

export function ActivityOverview() {
  const store = useActivityStore();
  const [stats, setStats] = useState<ActivityStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch activity stats
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/activities/stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch activity stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-stone-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-24 bg-stone-700 rounded"></div>
          <div className="h-24 bg-stone-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white">Activity Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.map((stat) => (
          <div 
            key={stat.type}
            className="bg-stone-700 rounded-lg p-4 hover:bg-stone-600 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-medium text-white">{stat.type}</span>
              <span className="text-sm text-stone-400">{stat.count} activities</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-stone-400">Total Distance</span>
                <span className="text-white">{formatDistance(stat.totalDistance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Total Duration</span>
                <span className="text-white">{formatDuration(stat.totalDuration)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Average Speed</span>
                <span className="text-white">{formatSpeed(stat.averageSpeed)}</span>
              </div>
            </div>

            {stat.lastActivity && (
              <div className="mt-3 pt-3 border-t border-stone-600">
                <div className="text-sm text-stone-400">Last Activity</div>
                <div className="flex justify-between mt-1">
                  <span className="text-white">{formatDate(stat.lastActivity.date)}</span>
                  <span className="text-stone-400">
                    {formatDistance(stat.lastActivity.metrics.distance)}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function formatDistance(meters: number): string {
  const kilometers = meters / 1000;
  return `${kilometers.toFixed(1)}km`;
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

function formatSpeed(metersPerSecond: number): string {
  const kmPerHour = (metersPerSecond * 3600) / 1000;
  return `${kmPerHour.toFixed(1)}km/h`;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}
 