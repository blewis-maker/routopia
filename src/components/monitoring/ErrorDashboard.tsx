import { useState, useEffect } from 'react';
import { ErrorChart } from './ErrorChart';
import { ErrorTable } from './ErrorTable';
import { ErrorFilter } from './ErrorFilter';
import { ErrorStats } from './ErrorStats';

export function ErrorDashboard() {
  const [timeRange, setTimeRange] = useState('24h');
  const [severity, setSeverity] = useState<string[]>([]);
  const [providers, setProviders] = useState<string[]>([]);
  const [errors, setErrors] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    high: 0,
    resolved: 0
  });

  useEffect(() => {
    fetchErrors();
  }, [timeRange, severity, providers]);

  async function fetchErrors() {
    const response = await fetch('/api/monitoring/errors', {
      method: 'POST',
      body: JSON.stringify({ timeRange, severity, providers })
    });
    const data = await response.json();
    setErrors(data.errors);
    setStats(data.stats);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Error Monitoring</h1>
        <ErrorFilter
          timeRange={timeRange}
          severity={severity}
          providers={providers}
          onTimeRangeChange={setTimeRange}
          onSeverityChange={setSeverity}
          onProvidersChange={setProviders}
        />
      </div>

      <ErrorStats stats={stats} />
      <ErrorChart errors={errors} />
      <ErrorTable errors={errors} />
    </div>
  );
} 