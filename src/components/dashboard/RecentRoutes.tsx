import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { RoutePreview } from '@/types/route';

export function RecentRoutes() {
  const [routes, setRoutes] = useState<RoutePreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await fetch('/api/routes/recent');
        const data = await response.json();
        setRoutes(data);
      } catch (error) {
        console.error('Failed to fetch recent routes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-stone-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-stone-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Recent Routes</h2>
        <Link 
          href="/routes" 
          className="text-emerald-500 hover:text-emerald-400 text-sm"
        >
          View All
        </Link>
      </div>

      <div className="space-y-4">
        {routes.length === 0 ? (
          <div className="text-center py-8 text-stone-400">
            <p>No routes created yet.</p>
            <Link 
              href="/route-planner"
              className="text-emerald-500 hover:text-emerald-400 mt-2 inline-block"
            >
              Create your first route
            </Link>
          </div>
        ) : (
          routes.map((route) => (
            <Link 
              key={route.id}
              href={`/routes/${route.id}`}
              className="block bg-stone-700 rounded-lg p-4 hover:bg-stone-600 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium text-white">{route.name}</h3>
                  <p className="text-sm text-stone-400">
                    {route.startLocation} → {route.endLocation}
                  </p>
                </div>
                <span className="text-sm text-stone-400">
                  {formatDate(route.createdAt)}
                </span>
              </div>

              <div className="flex space-x-4 text-sm text-stone-400">
                <span>{route.activityType}</span>
                <span>{formatDistance(route.distance)}</span>
                <span>{formatDuration(route.duration)}</span>
              </div>

              {route.thumbnail && (
                <div className="mt-3">
                  <img 
                    src={route.thumbnail} 
                    alt={route.name}
                    className="w-full h-24 object-cover rounded"
                  />
                </div>
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function formatDistance(meters: number): string {
  const kilometers = meters / 1000;
  return `${kilometers.toFixed(1)}km`;
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
} 