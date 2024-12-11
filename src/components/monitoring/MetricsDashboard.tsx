'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { styleGuide as sg } from '@/styles/theme/styleGuide';
import { PerformanceMetrics } from '@/services/monitoring/PerformanceMetrics';
import { RouteCache } from '@/lib/cache/RouteCache';

export function MetricsDashboard() {
  const [metrics, setMetrics] = useState<Record<string, any>>({});
  const [view, setView] = useState<'summary' | 'detailed'>('summary');
  const performanceMetrics = new PerformanceMetrics();
  const routeCache = new RouteCache();

  useEffect(() => {
    const updateMetrics = async () => {
      const current = {
        cache: await routeCache.getMetrics(),
        performance: performanceMetrics.getSummary(300000), // Last 5 minutes
        routes: {
          active: performanceMetrics.getMetric('active_routes'),
          monitored: performanceMetrics.getMetric('monitored_routes'),
          alerts: performanceMetrics.getMetric('route_alerts')
        }
      };
      setMetrics(current);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={cn(
      "font-mono text-sm",
      sg.colors.text.secondary
    )}>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>System Status:</span>
          <span className="text-green-500">● OPERATIONAL</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <MetricsPanel
            title="Cache"
            metrics={metrics.cache}
            fields={['hits', 'misses', 'latency']}
          />
          <MetricsPanel
            title="Routes"
            metrics={metrics.routes}
            fields={['active', 'monitored', 'alerts']}
          />
        </div>

        <div className="mt-4">
          <pre className="text-xs">
            {JSON.stringify(metrics, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

function MetricsPanel({ title, metrics, fields }: {
  title: string;
  metrics: Record<string, any>;
  fields: string[];
}) {
  if (!metrics) return null;

  return (
    <div className="p-2 border rounded">
      <div className="text-xs mb-2">{title}</div>
      {fields.map(field => (
        <div key={field} className="flex justify-between">
          <span>{field}:</span>
          <span>{metrics[field]}</span>
        </div>
      ))}
    </div>
  );
} 