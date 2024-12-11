import { useEffect, useState } from 'react';
import { CacheMetrics } from '@/types/monitoring';

interface CacheStats {
  hits: number;
  misses: number;
  latency: number;
  errorRate: number;
  size: number;
}

export function CacheMonitorDashboard() {
  const [stats, setStats] = useState<CacheStats>({
    hits: 0,
    misses: 0,
    latency: 0,
    errorRate: 0,
    size: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      const metrics = await fetch('/api/monitoring/cache-stats').then(r => r.json());
      setStats(metrics);
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-medium">Cache Hit Rate</h3>
        <p className="text-2xl font-bold">
          {((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(1)}%
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-medium">Average Latency</h3>
        <p className="text-2xl font-bold">{stats.latency.toFixed(2)}ms</p>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-medium">Error Rate</h3>
        <p className="text-2xl font-bold">{(stats.errorRate * 100).toFixed(2)}%</p>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-medium">Cache Size</h3>
        <p className="text-2xl font-bold">{(stats.size / 1024 / 1024).toFixed(2)}MB</p>
      </div>
    </div>
  );
} 