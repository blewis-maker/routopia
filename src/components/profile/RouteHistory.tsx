import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDistance, formatDuration, formatDate } from '@/utils/formatters';
import type { Route } from '@/types';

export function RouteHistory() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await fetch('/api/routes/history');
        const data = await response.json();
        setRoutes(data);
      } catch (error) {
        console.error('Failed to fetch route history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  const filteredRoutes = routes.filter(route => {
    if (filter === 'all') return true;
    return route.activityType.toLowerCase() === filter;
  });

  const sortedRoutes = [...filteredRoutes].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'distance':
        return b.distance - a.distance;
      case 'duration':
        return b.duration - a.duration;
      default:
        return 0;
    }
  });

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
    <div className="bg-stone-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Route History</h2>
        
        <div className="flex gap-4">
          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-stone-700 text-white rounded px-3 py-1"
          >
            <option value="all">All Activities</option>
            <option value="car">Car</option>
            <option value="bike">Bike</option>
            <option value="ski">Ski</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-stone-700 text-white rounded px-3 py-1"
          >
            <option value="date">Most Recent</option>
            <option value="distance">Distance</option>
            <option value="duration">Duration</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {sortedRoutes.length === 0 ? (
          <div className="text-center py-8 text-stone-400">
            <p>No routes found</p>
            <Link 
              href="/route-planner"
              className="text-emerald-500 hover:text-emerald-400 mt-2 inline-block"
            >
              Create a new route
            </Link>
          </div>
        ) : (
          sortedRoutes.map((route) => (
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