import { useState, useEffect } from 'react';
import { TrendingUp, Clock, Route } from 'lucide-react';

interface RouteStatistics {
  distance: number;
  elevation: number;
  duration: number;
}

export function RouteStats({ map }: { map: mapboxgl.Map | null }) {
  const [stats, setStats] = useState<RouteStatistics>({
    distance: 5.2, // km
    elevation: 320, // m
    duration: 120, // min
  });

  return (
    <div className="
      absolute bottom-4 right-4
      px-4 py-3 rounded-lg
      bg-stone-900/80 backdrop-blur-sm
      text-white
      transition-all duration-300
      hover:bg-stone-800
    ">
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <Route className="h-4 w-4 text-teal-400" />
          <span>{stats.distance}km</span>
        </div>
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-4 w-4 text-emerald-400" />
          <span>{stats.elevation}m</span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-cyan-400" />
          <span>{Math.floor(stats.duration / 60)}h {stats.duration % 60}m</span>
        </div>
      </div>
    </div>
  );
} 