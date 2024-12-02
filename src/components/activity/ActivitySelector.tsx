import React from 'react';
import type { ActivityType } from '@/types/activity';

interface Props {
  selectedActivity: ActivityType;
  onActivityChange: (activity: ActivityType) => void;
}

export const ActivitySelector: React.FC<Props> = ({ 
  selectedActivity, 
  onActivityChange 
}) => {
  const activities = [
    { type: 'car' as ActivityType, label: 'Drive', icon: '🚗' },
    { type: 'bike' as ActivityType, label: 'Bike', icon: '🚲' },
    { type: 'walk' as ActivityType, label: 'Walk', icon: '🚶' },
    { type: 'ski' as ActivityType, label: 'Ski', icon: '⛷️' }
  ];

  return (
    <div className="activity-selector" data-testid="activity-selector">
      <h3 className="text-lg font-semibold mb-3">Select Activity</h3>
      <div className="grid grid-cols-2 gap-3">
        {activities.map(({ type, label, icon }) => (
          <button
            key={type}
            onClick={() => onActivityChange(type)}
            className={`
              flex items-center gap-2 p-3 rounded-lg
              transition-colors duration-200
              ${selectedActivity === type 
                ? 'bg-teal-600 text-white' 
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'}
            `}
            data-testid={`activity-${type}`}
          >
            <span className="text-2xl" role="img" aria-label={label}>
              {icon}
            </span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}; 