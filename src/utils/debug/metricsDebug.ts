import { ActivityMetrics } from '@/types/activities/metrics';

export function debugMetrics(metrics: ActivityMetrics): string {
  const formatValue = (value: number): string => 
    value.toLocaleString(undefined, { maximumFractionDigits: 2 });

  const sections = [
    'Time Metrics:',
    `  Moving Time: ${formatValue(metrics.movingTime)}s`,
    `  Elapsed Time: ${formatValue(metrics.elapsedTime)}s`,
    '',
    'Distance Metrics:',
    `  Distance: ${formatValue(metrics.distance / 1000)}km`,
    `  Elevation Gain: ${formatValue(metrics.elevationGain)}m`,
    `  Elevation Loss: ${formatValue(metrics.elevationLoss)}m`,
    '',
    'Performance Metrics:',
    `  Average Speed: ${formatValue(metrics.averageSpeed * 3.6)}km/h`,
    `  Max Speed: ${formatValue(metrics.maxSpeed * 3.6)}km/h`,
  ];

  if (metrics.averagePower) {
    sections.push(`  Average Power: ${formatValue(metrics.averagePower)}W`);
  }
  if (metrics.maxPower) {
    sections.push(`  Max Power: ${formatValue(metrics.maxPower)}W`);
  }

  if (metrics.averageHeartRate || metrics.maxHeartRate) {
    sections.push('', 'Heart Rate Metrics:');
    if (metrics.averageHeartRate) {
      sections.push(`  Average HR: ${formatValue(metrics.averageHeartRate)}bpm`);
    }
    if (metrics.maxHeartRate) {
      sections.push(`  Max HR: ${formatValue(metrics.maxHeartRate)}bpm`);
    }
  }

  return sections.join('\n');
} 