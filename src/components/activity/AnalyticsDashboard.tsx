import { useState, useEffect } from 'react';
import { PerformanceMetrics } from './PerformanceMetrics';
import { ActivityHistory } from './ActivityHistory';
import { TrainingIntegration } from './TrainingIntegration';
import type { ActivityType, ActivityStats } from '@/types/activities';

interface Props {
  userId: string;
  defaultActivityType?: ActivityType;
}

export function AnalyticsDashboard({ userId, defaultActivityType }: Props) {
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | undefined>(defaultActivityType);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month');
  const [aggregateStats, setAggregateStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAggregateStats = async () => {
      try {
        const response = await fetch(
          `/api/activities/aggregate?userId=${userId}&timeframe=${timeframe}${selectedActivity ? `&type=${selectedActivity}` : ''}`
        );
        const data = await response.json();
        setAggregateStats(data);
      } catch (error) {
        console.error('Failed to fetch aggregate stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAggregateStats();
  }, [userId, selectedActivity, timeframe]);

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-stone-800 p-4 rounded-lg">
        <div className="flex gap-4 items-center">
          <select
            value={selectedActivity || ''}
            onChange={(e) => setSelectedActivity(e.target.value as ActivityType || undefined)}
            className="bg-stone-700 text-white rounded px-3 py-2"
          >
            <option value="">All Activities</option>
            <option value="WALK">Walking</option>
            <option value="RUN">Running</option>
            <option value="BIKE">Cycling</option>
            <option value="SKI">Skiing</option>
            <option value="HIKE">Hiking</option>
          </select>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as typeof timeframe)}
            className="bg-stone-700 text-white rounded px-3 py-2"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Metrics */}
        <div className="lg:col-span-2">
          <div className="bg-stone-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Performance Overview</h2>
            <PerformanceMetrics
              activityType={selectedActivity}
              timeframe={timeframe}
            />
          </div>
        </div>

        {/* Training Integration */}
        <div>
          <div className="bg-stone-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Training Status</h2>
            <TrainingIntegration
              activityType={selectedActivity}
              timeframe={timeframe}
            />
          </div>
        </div>
      </div>

      {/* Activity History */}
      <div className="bg-stone-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Recent Activities</h2>
        <ActivityHistory
          activityType={selectedActivity}
          timeframe={timeframe}
        />
      </div>
    </div>
  );
} 