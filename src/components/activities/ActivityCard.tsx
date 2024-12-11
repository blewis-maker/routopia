import { Activity } from '@prisma/client';
import { formatDistance, formatDuration } from '@/lib/utils/format';

interface ActivityCardProps {
  activity: Activity;
  onSelect?: (activity: Activity) => void;
}

export function ActivityCard({ activity, onSelect }: ActivityCardProps) {
  return (
    <div 
      onClick={() => onSelect?.(activity)}
      className="bg-stone-900 border border-stone-800 rounded-lg p-4 hover:border-stone-700 transition-colors cursor-pointer"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-stone-200">{activity.name || 'Untitled Activity'}</h3>
          <p className="text-sm text-stone-400">{activity.type}</p>
        </div>
        <div className="text-right">
          <span className="text-sm text-stone-400">
            {new Date(activity.startTime).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-stone-400">Distance</p>
          <p className="text-stone-200 font-medium">
            {formatDistance(activity.distance)}
          </p>
        </div>
        <div>
          <p className="text-stone-400">Duration</p>
          <p className="text-stone-200 font-medium">
            {formatDuration(activity.duration)}
          </p>
        </div>
        <div>
          <p className="text-stone-400">Status</p>
          <p className="text-stone-200 font-medium capitalize">
            {activity.status}
          </p>
        </div>
      </div>
    </div>
  );
} 