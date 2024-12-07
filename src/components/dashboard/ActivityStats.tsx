import React from 'react';

interface ActivityStatsProps {
  stats: {
    totalDistance: number;
    totalElevation: number;
    totalTime: number;
    completedRoutes: number;
  };
}

export const ActivityStats: React.FC<ActivityStatsProps> = ({ stats }) => {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Activity Statistics</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Total Distance</p>
          <p className="font-medium">{stats.totalDistance.toFixed(1)} km</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Total Elevation</p>
          <p className="font-medium">{stats.totalElevation}m</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Total Time</p>
          <p className="font-medium">{formatTime(stats.totalTime)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Completed Routes</p>
          <p className="font-medium">{stats.completedRoutes}</p>
        </div>
      </div>
    </div>
  );
};

export default ActivityStats; 