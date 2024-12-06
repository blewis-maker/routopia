import { useState, useEffect } from 'react';
import { formatDuration, formatDate } from '@/utils/formatters';
import type { Activity, ActivityStats } from '@/types';

export function ActivityHistory() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'stats'>('list');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [activitiesRes, statsRes] = await Promise.all([
          fetch('/api/activities/history'),
          fetch('/api/activities/stats')
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

    fetchData();
  }, []);

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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Activity History</h2>
        
        <div className="flex gap-2">
          <button
            onClick={() => setView('list')}
            className={`px-4 py-1 rounded ${
              view === 'list'
                ? 'bg-emerald-600 text-white'
                : 'bg-stone-700 text-stone-300 hover:bg-stone-600'
            }`}
          >
            List
          </button>
          <button
            onClick={() => setView('stats')}
            className={`px-4 py-1 rounded ${
              view === 'stats'
                ? 'bg-emerald-600 text-white'
                : 'bg-stone-700 text-stone-300 hover:bg-stone-600'
            }`}
          >
            Stats
          </button>
        </div>
      </div>

      {view === 'list' ? (
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-stone-400">
              <p>No activities recorded yet</p>
            </div>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="bg-stone-700 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-white">{activity.type}</h3>
                    <p className="text-sm text-stone-400">
                      {activity.location}
                    </p>
                  </div>
                  <span className="text-sm text-stone-400">
                    {formatDate(activity.date)}
                  </span>
                </div>

                <div className="flex space-x-4 text-sm text-stone-400">
                  <span>Duration: {formatDuration(activity.duration)}</span>
                  {activity.distance && (
                    <span>Distance: {activity.distance}km</span>
                  )}
                  {activity.elevation && (
                    <span>Elevation: {activity.elevation}m</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats && (
            <>
              {/* Total Activities */}
              <div className="bg-stone-700 rounded-lg p-4">
                <h3 className="text-lg font-medium text-white mb-2">
                  Total Activities
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-emerald-500">
                      {stats.totalActivities}
                    </p>
                    <p className="text-sm text-stone-400">Activities</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-emerald-500">
                      {stats.totalDuration}h
                    </p>
                    <p className="text-sm text-stone-400">Total Time</p>
                  </div>
                </div>
              </div>

              {/* Activity Breakdown */}
              <div className="bg-stone-700 rounded-lg p-4">
                <h3 className="text-lg font-medium text-white mb-2">
                  Activity Types
                </h3>
                <div className="space-y-2">
                  {Object.entries(stats.byType).map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center">
                      <span className="text-stone-300">{type}</span>
                      <span className="text-emerald-500 font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Progress */}
              <div className="bg-stone-700 rounded-lg p-4">
                <h3 className="text-lg font-medium text-white mb-2">
                  Recent Progress
                </h3>
                <div className="space-y-2">
                  {stats.recentProgress.map((progress, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-stone-300">{progress.week}</span>
                      <span className="text-emerald-500 font-medium">
                        {progress.activities} activities
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Achievement Progress */}
              <div className="bg-stone-700 rounded-lg p-4">
                <h3 className="text-lg font-medium text-white mb-2">
                  Achievements
                </h3>
                <div className="space-y-2">
                  {stats.achievements.map((achievement) => (
                    <div key={achievement.id} className="flex justify-between items-center">
                      <span className="text-stone-300">{achievement.name}</span>
                      <span className="text-emerald-500 font-medium">
                        {achievement.progress}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
} 