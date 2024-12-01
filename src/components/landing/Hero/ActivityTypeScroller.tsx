'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const activities = [
  { id: 'hiking', name: 'Hiking', icon: '🥾' },
  { id: 'cycling', name: 'Cycling', icon: '🚴' },
  { id: 'running', name: 'Running', icon: '🏃' },
  { id: 'skiing', name: 'Skiing', icon: '⛷️' },
  { id: 'walking', name: 'Walking', icon: '🚶' }
];

export default function ActivityTypeScroller() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextActivity = () => {
    setCurrentIndex((prev) => (prev + 1) % activities.length);
  };

  const prevActivity = () => {
    setCurrentIndex((prev) => (prev - 1 + activities.length) % activities.length);
  };

  return (
    <div className="relative flex items-center justify-between p-4 bg-stone-900/80 backdrop-blur-md rounded-lg">
      <button
        onClick={prevActivity}
        className="p-2 hover:bg-stone-800 rounded-full transition-colors"
        aria-label="Previous activity"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div className="flex flex-col items-center space-y-2">
        <span className="text-3xl" role="img" aria-label={activities[currentIndex].name}>
          {activities[currentIndex].icon}
        </span>
        <span className="text-sm font-medium">{activities[currentIndex].name}</span>
      </div>

      <button
        onClick={nextActivity}
        className="p-2 hover:bg-stone-800 rounded-full transition-colors"
        aria-label="Next activity"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
} 