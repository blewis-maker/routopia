import React from 'react';

interface RoutePanelProps {
  route: {
    name: string;
    distance: number;
    elevation: number;
    duration?: number;
    difficulty?: string;
  };
  onEdit?: () => void;
  onDelete?: () => void;
}

export const RoutePanel: React.FC<RoutePanelProps> = ({
  route,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{route.name}</h3>
        <div className="space-x-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
            >
              Delete
            </button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Distance</p>
          <p className="font-medium">{route.distance.toFixed(1)} km</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Elevation</p>
          <p className="font-medium">{route.elevation}m</p>
        </div>
        {route.duration && (
          <div>
            <p className="text-sm text-gray-500">Duration</p>
            <p className="font-medium">{Math.round(route.duration / 60)}h {route.duration % 60}m</p>
          </div>
        )}
        {route.difficulty && (
          <div>
            <p className="text-sm text-gray-500">Difficulty</p>
            <p className="font-medium capitalize">{route.difficulty}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoutePanel; 