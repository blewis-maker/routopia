import { RouteProgress } from '@/services/monitoring/RouteMonitor';
import { Clock, MapPin } from 'lucide-react';

interface RouteProgressBarProps {
  progress: RouteProgress;
  className?: string;
}

export function RouteProgressBar({ progress, className = '' }: RouteProgressBarProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {/* Progress Bar */}
      <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${progress.completionPercentage}%` }}
        />
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <div className="text-stone-400">Distance</div>
          <div className="text-stone-200 font-medium">
            {(progress.distanceCovered / 1000).toFixed(1)}km
          </div>
        </div>
        <div>
          <div className="text-stone-400">Time</div>
          <div className="text-stone-200 font-medium">
            {Math.floor(progress.timeElapsed / 60)}min
          </div>
        </div>
        <div>
          <div className="text-stone-400">Remaining</div>
          <div className="text-stone-200 font-medium">
            {Math.floor(progress.estimatedTimeRemaining / 60)}min
          </div>
        </div>
      </div>

      {/* Next Milestone */}
      {progress.nextMilestone && (
        <div className="flex items-center gap-2 text-sm text-stone-300 mt-2">
          <MapPin className="w-4 h-4" />
          <span>
            Next {progress.nextMilestone.type}: {(progress.nextMilestone.distance / 1000).toFixed(1)}km
            ({Math.floor(progress.nextMilestone.estimatedTime / 60)}min)
          </span>
        </div>
      )}
    </div>
  );
} 