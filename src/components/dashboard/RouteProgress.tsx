import React from 'react';

interface RouteProgressProps {
  route: {
    id: string;
    name: string;
    progress: number;
    nextMilestone: string;
    remainingDistance: number;
  };
}

export const RouteProgress: React.FC<RouteProgressProps> = ({ route }) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{route.name}</h3>
        <span className="text-sm font-medium text-blue-600">
          {route.progress}% Complete
        </span>
      </div>
      
      <div className="mb-4">
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${route.progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <p className="text-sm text-gray-500">Next Milestone</p>
          <p className="font-medium">{route.nextMilestone}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Remaining Distance</p>
          <p className="font-medium">{route.remainingDistance.toFixed(1)} km</p>
        </div>
      </div>
    </div>
  );
};

export default RouteProgress; 