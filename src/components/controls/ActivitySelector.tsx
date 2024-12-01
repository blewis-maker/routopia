import React, { useCallback, useRef } from 'react';
import type { ActivityType } from '@/types/routes';
import { useKeyboardNav } from '@/hooks/useKeyboardNav';

interface Props {
  selectedActivity: ActivityType;
  onActivityChange: (activity: ActivityType) => void;
  id?: string;
}

export const ActivitySelector: React.FC<Props> = ({ 
  selectedActivity, 
  onActivityChange,
  id = 'activity-selector'
}) => {
  const activities = [
    { type: 'car', label: 'Drive', icon: '🚗', description: 'Travel by car' },
    { type: 'bike', label: 'Bike', icon: '🚲', description: 'Travel by bicycle' },
    { type: 'walk', label: 'Walk', icon: '🚶', description: 'Travel by foot' },
    { type: 'ski', label: 'Ski', icon: '⛷️', description: 'Travel by ski' }
  ] as const;

  const containerRef = useRef<HTMLDivElement>(null);
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        const nextIndex = (index + 1) % activities.length;
        onActivityChange(activities[nextIndex].type);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        const prevIndex = (index - 1 + activities.length) % activities.length;
        onActivityChange(activities[prevIndex].type);
        break;
    }
  }, [onActivityChange]);

  return (
    <div 
      ref={containerRef}
      role="radiogroup"
      aria-label="Select travel mode"
      className="activity-selector"
      id={id}
    >
      {activities.map(({ type, label, icon, description }, index) => (
        <button
          key={type}
          role="radio"
          aria-checked={selectedActivity === type}
          aria-label={description}
          onClick={() => onActivityChange(type)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className={`activity-button ${selectedActivity === type ? 'active' : ''}`}
          tabIndex={selectedActivity === type ? 0 : -1}
          data-testid={`activity-${type}`}
        >
          <span className="text-2xl" aria-hidden="true">{icon}</span>
          <span className="text-sm text-stone-300">{label}</span>
        </button>
      ))}
    </div>
  );
}; 