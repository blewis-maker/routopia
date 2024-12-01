import React from 'react';
import { ActivityType } from '@/types/routes';

interface Props {
  selectedActivity: ActivityType;
  onActivityChange: (activity: ActivityType) => void;
}

const activities: Array<{
  type: ActivityType;
  icon: string;
  label: string;
}> = [
  { type: 'car', icon: '🚗', label: 'Drive' },
  { type: 'bike', icon: '🚲', label: 'Bike' },
  { type: 'walk', icon: '🚶', label: 'Walk' },
  { type: 'ski', icon: '⛷️', label: 'Ski' },
];

export const ActivitySelector: React.FC<Props> = ({ 
  selectedActivity, 
  onActivityChange 
}) => {
  return (
    <div className="activity-selector flex gap-2 p-2 bg-stone-800 rounded-lg">
      {activities.map(({ type, icon, label }) => (
        <button
          key={type}
          onClick={() => onActivityChange(type)}
          className={`
            flex flex-col items-center p-2 rounded transition-colors
            ${selectedActivity === type 
              ? 'bg-emerald-600 text-white' 
              : 'bg-stone-700 text-stone-300 hover:bg-stone-600'
            }
          `}
          aria-label={`Select ${label} activity`}
        >
          <span className="text-xl" role="img" aria-hidden="true">
            {icon}
          </span>
          <span className="text-xs mt-1">{label}</span>
        </button>
      ))}
    </div>
  );
}; 