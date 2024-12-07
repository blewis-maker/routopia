'use client';

import { useEffect, useState } from 'react';

interface Activity {
  id: string;
  type: string;
  duration: number;
  distance: number;
  date: string;
}

export function ActivityTracker() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated activity data fetch
    setTimeout(() => {
      setActivities([
        {
          id: '1',
          type: 'Running',
          duration: 45,
          distance: 5.2,
          date: '2024-01-10',
        },
        {
          id: '2',
          type: 'Cycling',
          duration: 90,
          distance: 20.5,
          date: '2024-01-09',
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <div className="activity-tracker activity-tracker--loading">Loading...</div>;
  }

  return (
    <div className="activity-tracker">
      <h2 className="activity-tracker__title">Recent Activities</h2>
      <div className="activity-tracker__list">
        {activities.map((activity) => (
          <div key={activity.id} className="activity-tracker__item">
            <div className="activity-tracker__type">{activity.type}</div>
            <div className="activity-tracker__stats">
              <span>{activity.distance} miles</span>
              <span>{activity.duration} minutes</span>
            </div>
            <div className="activity-tracker__date">{activity.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
} 