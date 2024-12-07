import { MapPin, Calendar, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Route {
  id: string;
  name: string;
  date: string;
  duration: string;
  distance: string;
  startPoint: string;
  endPoint: string;
}

const recentRoutes: Route[] = [
  {
    id: '1',
    name: 'City Park Loop',
    date: '2024-01-15',
    duration: '45 min',
    distance: '5.2 km',
    startPoint: 'Central Park',
    endPoint: 'Downtown Square',
  },
  {
    id: '2',
    name: 'Riverside Trail',
    date: '2024-01-14',
    duration: '1h 30min',
    distance: '12.5 km',
    startPoint: 'River Station',
    endPoint: 'Harbor View',
  },
  {
    id: '3',
    name: 'Mountain Trek',
    date: '2024-01-13',
    duration: '2h 15min',
    distance: '8.7 km',
    startPoint: 'Base Camp',
    endPoint: 'Summit Point',
  },
];

export function RecentRoutes() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Recent Routes</h2>
        <Link
          href="/routes"
          className="text-sm text-indigo-600 hover:text-indigo-500 flex items-center"
        >
          View all
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>

      <div className="space-y-4">
        {recentRoutes.map((route) => (
          <div
            key={route.id}
            className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-900">{route.name}</h3>
                <div className="mt-1 space-y-1">
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    {route.startPoint} → {route.endPoint}
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(route.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {route.duration}
                    </span>
                  </div>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {route.distance}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 