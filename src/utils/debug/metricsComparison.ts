import { ActivityMetrics } from '@/types/activities/metrics';
import { debugMetrics } from './metricsDebug';

export interface MetricsDiff {
  field: keyof ActivityMetrics;
  oldValue: number;
  newValue: number;
  percentChange: number;
}

export function compareMetrics(oldMetrics: ActivityMetrics, newMetrics: ActivityMetrics): MetricsDiff[] {
  const diffs: MetricsDiff[] = [];
  const fields = Object.keys(oldMetrics) as Array<keyof ActivityMetrics>;

  for (const field of fields) {
    const oldValue = oldMetrics[field];
    const newValue = newMetrics[field];

    if (typeof oldValue === 'number' && typeof newValue === 'number') {
      const percentChange = ((newValue - oldValue) / oldValue) * 100;
      if (percentChange !== 0) {
        diffs.push({
          field,
          oldValue,
          newValue,
          percentChange
        });
      }
    }
  }

  return diffs;
}

export function formatMetricsDiff(diff: MetricsDiff): string {
  const direction = diff.percentChange > 0 ? '↑' : '↓';
  return `${diff.field}: ${diff.oldValue} → ${diff.newValue} (${direction}${Math.abs(diff.percentChange).toFixed(1)}%)`;
}

export function debugMetricsComparison(oldMetrics: ActivityMetrics, newMetrics: ActivityMetrics): string {
  const diffs = compareMetrics(oldMetrics, newMetrics);
  
  if (diffs.length === 0) {
    return 'No differences found in metrics';
  }

  return [
    'Metrics Comparison:',
    '=================',
    '',
    'Original Metrics:',
    debugMetrics(oldMetrics),
    '',
    'New Metrics:',
    debugMetrics(newMetrics),
    '',
    'Changes:',
    ...diffs.map(diff => formatMetricsDiff(diff))
  ].join('\n');
} 