import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Route } from '@/types/route';
import type { POI } from '@/types/poi';

interface Update {
  id: string;
  type: 'ROUTE' | 'POI';
  timestamp: string;
  message: string;
  severity: 'info' | 'warning' | 'alert';
  data: {
    route?: Route;
    poi?: POI;
  };
}

export function RealTimeUpdates() {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const response = await fetch('/api/updates/realtime');
        const data = await response.json();
        setUpdates(data);
      } catch (error) {
        console.error('Failed to fetch updates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpdates();

    // Set up WebSocket connection for real-time updates
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001');
    
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      setUpdates((prev) => [update, ...prev].slice(0, 10));
    };

    return () => {
      ws.close();
    };
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-stone-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-stone-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white">Live Updates</h2>

      <div className="space-y-2">
        {updates.length === 0 ? (
          <div className="text-center py-8 text-stone-400">
            No updates available
          </div>
        ) : (
          updates.map((update) => (
            <div
              key={update.id}
              className={`bg-stone-700 rounded-lg p-4 border-l-4 ${
                update.severity === 'alert'
                  ? 'border-red-500'
                  : update.severity === 'warning'
                  ? 'border-yellow-500'
                  : 'border-emerald-500'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <p className="text-white">{update.message}</p>
                  <p className="text-sm text-stone-400">
                    {formatTimestamp(update.timestamp)}
                  </p>
                </div>
                {update.type === 'ROUTE' && update.data.route && (
                  <Link
                    href={`/routes/${update.data.route.id}`}
                    className="text-emerald-500 hover:text-emerald-400 text-sm ml-4"
                  >
                    View Route
                  </Link>
                )}
                {update.type === 'POI' && update.data.poi && (
                  <Link
                    href={`/poi/${update.data.poi.id}`}
                    className="text-emerald-500 hover:text-emerald-400 text-sm ml-4"
                  >
                    View Place
                  </Link>
                )}
              </div>

              {update.type === 'ROUTE' && update.data.route && (
                <div className="text-sm text-stone-400">
                  Route: {update.data.route.name}
                </div>
              )}
              {update.type === 'POI' && update.data.poi && (
                <div className="text-sm text-stone-400">
                  Place: {update.data.poi.name}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  if (diff < 60000) { // Less than 1 minute
    return 'Just now';
  } else if (diff < 3600000) { // Less than 1 hour
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m ago`;
  } else if (diff < 86400000) { // Less than 1 day
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }
} 