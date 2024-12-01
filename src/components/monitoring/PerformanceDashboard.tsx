import React, { useEffect, useState } from 'react';
import { PerformanceMetrics } from '@/services/monitoring/PerformanceMetrics';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface Props {
  metrics: PerformanceMetrics;
}

export const PerformanceDashboard: React.FC<Props> = ({ metrics }) => {
  const [data, setData] = useState<Record<string, any[]>>({});
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    'route.loadTime',
    'map.fps',
    'api.responseTime'
  ]);

  useEffect(() => {
    const unsubscribe = metrics.subscribe((metric) => {
      setData(prev => ({
        ...prev,
        [metric.name]: [...(prev[metric.name] || []), {
          timestamp: new Date(metric.points[metric.points.length - 1].timestamp),
          value: metric.points[metric.points.length - 1].value
        }]
      }));
    });

    return unsubscribe;
  }, [metrics]);

  return (
    <div className="performance-dashboard">
      <h2>Performance Metrics</h2>
      
      {selectedMetrics.map(metricName => {
        const metric = metrics.getMetric(metricName);
        if (!metric) return null;

        const aggregated = metrics.getAggregatedMetrics(metricName);

        return (
          <div key={metricName} className="metric-card">
            <h3>{metricName}</h3>
            <div className="metric-stats">
              <span>Avg: {aggregated.avg.toFixed(2)}{metric.unit}</span>
              <span>Max: {aggregated.max.toFixed(2)}{metric.unit}</span>
              <span>P95: {aggregated.p95.toFixed(2)}{metric.unit}</span>
            </div>
            <LineChart width={600} height={200} data={data[metricName]}>
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#8884d8" 
                dot={false} 
              />
            </LineChart>
          </div>
        );
      })}
    </div>
  );
}; 