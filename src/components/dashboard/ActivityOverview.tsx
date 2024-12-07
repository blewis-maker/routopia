import { Activity, TrendingUp, Map, Clock } from 'lucide-react';

interface ActivityStat {
  label: string;
  value: string;
  change: string;
  icon: React.ElementType;
  trend: 'up' | 'down' | 'neutral';
}

const stats: ActivityStat[] = [
  {
    label: 'Total Distance',
    value: '284.5 km',
    change: '+4.75%',
    icon: Activity,
    trend: 'up',
  },
  {
    label: 'Active Routes',
    value: '12',
    change: '+2',
    icon: Map,
    trend: 'up',
  },
  {
    label: 'Avg. Duration',
    value: '1h 45m',
    change: '-5min',
    icon: Clock,
    trend: 'down',
  },
  {
    label: 'Progress',
    value: '87%',
    change: '+2.3%',
    icon: TrendingUp,
    trend: 'up',
  },
];

export function ActivityOverview() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="p-4 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center">
              <div className="p-2 bg-indigo-500 rounded-lg">
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
            <div className="mt-2">
              <span
                className={`text-sm font-medium ${
                  stat.trend === 'up'
                    ? 'text-green-600'
                    : stat.trend === 'down'
                    ? 'text-red-600'
                    : 'text-gray-600'
                }`}
              >
                {stat.change}
              </span>
              <span className="text-sm text-gray-600"> vs last month</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
 