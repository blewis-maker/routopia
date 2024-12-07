'use client';

import React from 'react';

interface Activity {
  id: string;
  type: 'hiking' | 'cycling' | 'running';
  name: string;
  distance: number;
  duration: number;
  elevation: number;
  date: string;
}

interface ActivityTrackerProps {
  activities?: Activity[];
  loading?: boolean;
  error?: string;
}

export const ActivityTracker: React.FC<ActivityTrackerProps> = ({
  activities,
  loading = false,
  error,
}) => {
  const mockActivities: Activity[] = [
    {
      id: '1',
      type: 'hiking',
      name: 'Boulder Flatirons Trail',
      distance: 5.2,
      duration: 180,
      elevation: 450,
      date: '2024-01-20',
    },
    {
      id: '2',
      type: 'cycling',
      name: 'Clear Creek Trail',
      distance: 15.8,
      duration: 120,
      elevation: 250,
      date: '2024-01-19',
    },
    {
      id: '3',
      type: 'running',
      name: 'Cherry Creek Path',
      distance: 3.1,
      duration: 45,
      elevation: 50,
      date: '2024-01-18',
    },
  ];

  const displayActivities = activities || mockActivities;

  const activityIcons = {
    hiking: '🥾',
    cycling: '🚴',
    running: '🏃',
  };

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 animate-pulse"
          >
            <div className="space-y-3">
              <div className="h-5 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4" />
              <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2" />
              <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
        Recent Activities
      </h2>

      {displayActivities.map((activity) => (
        <div
          key={activity.id}
          className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4"
        >
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{activityIcons[activity.type]}</span>
            <div>
              <h3 className="font-medium text-neutral-900 dark:text-white">
                {activity.name}
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {new Date(activity.date).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Distance</p>
              <p className="font-medium text-neutral-900 dark:text-white">
                {activity.distance.toFixed(1)} mi
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Duration</p>
              <p className="font-medium text-neutral-900 dark:text-white">
                {Math.floor(activity.duration / 60)}h {activity.duration % 60}m
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Elevation</p>
              <p className="font-medium text-neutral-900 dark:text-white">
                {activity.elevation} ft
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}; 