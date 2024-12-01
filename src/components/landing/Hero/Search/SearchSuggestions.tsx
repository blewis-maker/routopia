import { Compass, Trending } from 'lucide-react';
import { LandingAnalytics } from '@/utils/analytics';

const popularSearches = [
  { id: 'p1', text: 'Hiking Trails', icon: '🥾' },
  { id: 'p2', text: 'Mountain Biking', icon: '🚴' },
  { id: 'p3', text: 'Scenic Routes', icon: '🏔️' },
  { id: 'p4', text: 'City Walks', icon: '🌆' }
];

const nearbyActivities = [
  { id: 'n1', text: 'Central Park Loop', distance: '0.5 mi' },
  { id: 'n2', text: 'Hudson River Trail', distance: '1.2 mi' },
  { id: 'n3', text: 'Brooklyn Bridge Walk', distance: '2.0 mi' }
];

export function SearchSuggestions() {
  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      {/* Popular Searches */}
      <div className="
        bg-stone-900/80 backdrop-blur-md
        rounded-lg border border-stone-700
        p-4
      ">
        <div className="flex items-center space-x-2 mb-3">
          <Trending className="h-4 w-4 text-teal-400" />
          <h3 className="text-sm font-medium text-stone-400">
            Popular Searches
          </h3>
        </div>
        <ul className="space-y-2">
          {popularSearches.map((item) => (
            <li
              key={item.id}
              onClick={() => {
                LandingAnalytics.track({
                  name: 'popular_search_click',
                  properties: { searchId: item.id }
                });
              }}
              className="
                flex items-center space-x-2
                px-3 py-2 rounded-md
                hover:bg-stone-800
                cursor-pointer
                transition-colors
              "
            >
              <span>{item.icon}</span>
              <span className="text-white">{item.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Nearby Activities */}
      <div className="
        bg-stone-900/80 backdrop-blur-md
        rounded-lg border border-stone-700
        p-4
      ">
        <div className="flex items-center space-x-2 mb-3">
          <Compass className="h-4 w-4 text-emerald-400" />
          <h3 className="text-sm font-medium text-stone-400">
            Nearby Activities
          </h3>
        </div>
        <ul className="space-y-2">
          {nearbyActivities.map((item) => (
            <li
              key={item.id}
              onClick={() => {
                LandingAnalytics.track({
                  name: 'nearby_activity_click',
                  properties: { activityId: item.id }
                });
              }}
              className="
                flex items-center justify-between
                px-3 py-2 rounded-md
                hover:bg-stone-800
                cursor-pointer
                transition-colors
              "
            >
              <span className="text-white">{item.text}</span>
              <span className="text-sm text-stone-400">
                {item.distance}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 