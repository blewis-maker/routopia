import { useProgress } from '@/contexts/ProgressContext';

export function ProgressOverview() {
  const { progress } = useProgress();
  
  if (!progress) return null;

  return (
    <div className="space-y-4">
      <CoreProgressDisplay progress={progress.core} />
      <SegmentProgressDisplay progress={progress.segment} />
      <MilestoneDisplay progress={progress.milestone} />
      <SafetyIndicators progress={progress.safety} />
      <EnvironmentalStatus progress={progress.environmental} />
      <RouteOptimizationPanel progress={progress.optimization} />
    </div>
  );
} 