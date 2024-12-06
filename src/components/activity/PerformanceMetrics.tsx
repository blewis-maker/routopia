import { useState, useEffect } from 'react';
import type { ActivityPerformanceTrends, ActivityType } from '@/types/activities';

interface Props {
  activityType?: ActivityType;
  timeframe?: 'week' | 'month' | 'year';
}

export function PerformanceMetrics({ activityType, timeframe = 'week' }: Props) {
  const [trends, setTrends] = useState<ActivityPerformanceTrends | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const response = await fetch(
          `/api/activities/trends?type=${activityType}&timeframe=${timeframe}`
        );
        const data = await response.json();
        setTrends(data);
      } catch (error) {
        console.error('Failed to fetch performance trends:', error);
      } finally {
        setLoading(false);
      }
    };

    if (activityType) {
      fetchTrends();
    }
  }, [activityType, timeframe]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-stone-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-stone-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!trends) {
    return (
      <div className="text-center py-8 text-stone-400">
        <p>No performance data available</p>
      </div>
    );
  }

  return (
    <div className="bg-stone-800 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-white mb-6">Performance Metrics</h2>

      <div className="space-y-6">
        {/* Distance Trends */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-white">Distance</h3>
          <div className="flex items-center justify-between">
            <span className="text-stone-300">Current Average</span>
            <span className="text-emerald-500 font-medium">
              {trends.metrics.distance.currentAverage.toFixed(1)} km
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-stone-300">Change</span>
            <span className={`font-medium ${
              trends.metrics.distance.delta > 0 ? 'text-emerald-500' : 'text-red-500'
            }`}>
              {trends.metrics.distance.deltaPercentage > 0 ? '+' : ''}
              {trends.metrics.distance.deltaPercentage.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Speed Trends */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-white">Speed</h3>
          <div className="flex items-center justify-between">
            <span className="text-stone-300">Current Average</span>
            <span className="text-emerald-500 font-medium">
              {trends.metrics.speed.currentAverage.toFixed(1)} km/h
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-stone-300">Change</span>
            <span className={`font-medium ${
              trends.metrics.speed.delta > 0 ? 'text-emerald-500' : 'text-red-500'
            }`}>
              {trends.metrics.speed.deltaPercentage > 0 ? '+' : ''}
              {trends.metrics.speed.deltaPercentage.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Duration Trends */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-white">Duration</h3>
          <div className="flex items-center justify-between">
            <span className="text-stone-300">Current Average</span>
            <span className="text-emerald-500 font-medium">
              {Math.floor(trends.metrics.duration.currentAverage / 60)}h {trends.metrics.duration.currentAverage % 60}m
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-stone-300">Change</span>
            <span className={`font-medium ${
              trends.metrics.duration.delta > 0 ? 'text-emerald-500' : 'text-red-500'
            }`}>
              {trends.metrics.duration.deltaPercentage > 0 ? '+' : ''}
              {trends.metrics.duration.deltaPercentage.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Heart Rate Trends (if available) */}
        {trends.metrics.heartRate && (
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-white">Heart Rate</h3>
            <div className="flex items-center justify-between">
              <span className="text-stone-300">Current Average</span>
              <span className="text-emerald-500 font-medium">
                {trends.metrics.heartRate.currentAverage.toFixed(0)} bpm
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-300">Change</span>
              <span className={`font-medium ${
                trends.metrics.heartRate.delta < 0 ? 'text-emerald-500' : 'text-red-500'
              }`}>
                {trends.metrics.heartRate.deltaPercentage > 0 ? '+' : ''}
                {trends.metrics.heartRate.deltaPercentage.toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 