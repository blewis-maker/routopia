import { Car, Bike, Footprints, Snowflake, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';

type ActivityType = 'drive' | 'bike' | 'run' | 'ski' | 'adventure';

interface ActivityTypeSelectorProps {
  selected: ActivityType;
  onChange: (type: ActivityType) => void;
}

const activities = [
  { type: 'drive' as const, icon: Car, label: 'Drive' },
  { type: 'bike' as const, icon: Bike, label: 'Bike' },
  { type: 'run' as const, icon: Footprints, label: 'Run' },
  { type: 'ski' as const, icon: Snowflake, label: 'Ski' },
  { type: 'adventure' as const, icon: Compass, label: 'Adventure' }
];

export function ActivityTypeSelector({ selected, onChange }: ActivityTypeSelectorProps) {
  return (
    <div className="flex gap-2 p-2">
      {activities.map(({ type, icon: Icon, label }) => (
        <button
          key={type}
          onClick={() => onChange(type)}
          className={cn(
            'relative group p-2 rounded-lg transition-all duration-200',
            'hover:bg-stone-800/50',
            selected === type 
              ? 'text-teal-500' 
              : 'text-stone-400 hover:text-stone-300'
          )}
          title={label}
        >
          <Icon className="w-5 h-5" />
          
          {/* Tooltip */}
          <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 
            bg-stone-800 text-stone-200 text-xs rounded opacity-0 group-hover:opacity-100 
            transition-opacity whitespace-nowrap">
            {label}
          </span>
        </button>
      ))}
    </div>
  );
} 