import { useState, useEffect } from 'react';
import type { ActivityStats, ActivityType, ActivityMetrics } from '@/types/activities';

interface Activity {
  id: string;
  type: ActivityType;
  date: string;
  metrics: ActivityMetrics;
  notes?: string;
}

interface Props {
  activityType?: ActivityType;
  timeframe?: 'week' | 'month' | 'year' | 'all';
}

export function ActivityHistory({ activityType, timeframe = 'month' }: Props) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        const [activitiesRes, statsRes] = await Promise.all([
          fetch(`/api/activities?type=${activityType}&timeframe=${timeframe}`),
          fetch(`/api/activities/stats?type=${activityType}&timeframe=${timeframe}`)
        ]);
        
        const [activitiesData, statsData] = await Promise.all([
          activitiesRes.json(),
          statsRes.json()
        ]);

        setActivities(activitiesData);
        setStats(statsData);
      } catch (error) {
        console.error('Failed to fetch activity data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (activityType) {
      fetchActivityData();
    }
  }, [activityType, timeframe]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-stone-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-stone-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-800 rounded-lg p-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-stone-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-stone-400">Total Distance</h3>
            <p className="text-2xl font-semibold text-white mt-1">
              {stats.totalDistance.toFixed(1)} km
            </p>
          </div>
          <div className="bg-stone-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-stone-400">Total Duration</h3>
            <p className="text-2xl font-semibold text-white mt-1">
              {Math.floor(stats.totalDuration / 60)}h {stats.totalDuration % 60}m
            </p>
          </div>
          <div className="bg-stone-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-stone-400">Average Speed</h3>
            <p className="text-2xl font-semibold text-white mt-1">
              {stats.averageSpeed.toFixed(1)} km/h
            </p>
          </div>
        </div>
      )}

      {/* Activity List */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Activity History</h2>
        
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-stone-400">
              <p>No activities recorded</p>
              <p className="text-sm mt-2">
                Start tracking your activities to see them here
              </p>
            </div>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="bg-stone-700 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium text-white">{activity.type}</h3>
                    <p className="text-sm text-stone-400">
                      {new Date(activity.date).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => window.location.href = `/activities/${activity.id}`}
                    className="text-emerald-500 hover:text-emerald-400 text-sm"
                  >
                    View Details
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-stone-400">Distance</p>
                    <p className="text-white">{activity.metrics.distance.toFixed(1)} km</p>
                  </div>
                  <div>
                    <p className="text-sm text-stone-400">Duration</p>
                    <p className="text-white">
                      {Math.floor(activity.metrics.duration / 60)}h {activity.metrics.duration % 60}m
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-stone-400">Speed</p>
                    <p className="text-white">{activity.metrics.speed.toFixed(1)} km/h</p>
                  </div>
                  <div>
                    <p className="text-sm text-stone-400">Calories</p>
                    <p className="text-white">{activity.metrics.calories} kcal</p>
                  </div>
                </div>

                {activity.metrics.heartRate && (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-stone-400">Avg Heart Rate</p>
                      <p className="text-white">{activity.metrics.heartRate.average} bpm</p>
                    </div>
                    <div>
                      <p className="text-sm text-stone-400">Max Heart Rate</p>
                      <p className="text-white">{activity.metrics.heartRate.max} bpm</p>
                    </div>
                  </div>
                )}

                {activity.notes && (
                  <p className="mt-4 text-sm text-stone-400">
                    {activity.notes}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 