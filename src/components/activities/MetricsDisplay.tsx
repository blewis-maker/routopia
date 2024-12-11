import { ActivityMetrics } from '@/types/activities/metrics';
import { Card } from '@/components/ui/Card';
import { LineChart } from '@/components/charts/LineChart';

interface MetricsDisplayProps {
  metrics: ActivityMetrics;
  className?: string;
}

export function MetricsDisplay({ metrics, className }: MetricsDisplayProps) {
  return (
    <Card className={className}>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-stone-200 mb-4">Activity Metrics</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <MetricItem 
            label="Avg Speed"
            value={`${metrics.averageSpeed.toFixed(1)} km/h`}
          />
          <MetricItem 
            label="Max Speed"
            value={`${metrics.maxSpeed.toFixed(1)} km/h`}
          />
          <MetricItem 
            label="Elevation Gain"
            value={`${metrics.elevationGain}m`}
          />
          <MetricItem 
            label="Moving Time"
            value={`${(metrics.movingTime / 60).toFixed(0)} min`}
          />
        </div>

        <div className="h-48">
          <LineChart 
            data={metrics.speedOverTime}
            xLabel="Time"
            yLabel="Speed (km/h)"
          />
        </div>
      </div>
    </Card>
  );
}

function MetricItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-stone-400">{label}</p>
      <p className="text-lg font-semibold text-stone-200">{value}</p>
    </div>
  );
} 