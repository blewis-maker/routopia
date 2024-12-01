import { useState, useEffect } from 'react';
import { Clock, X } from 'lucide-react';
import { SearchService } from '@/utils/search-service';
import { LandingAnalytics } from '@/utils/analytics';

export function RecentSearches() {
  const [recentSearches, setRecentSearches] = useState<any[]>([]);

  useEffect(() => {
    setRecentSearches(SearchService.getRecentSearches());
  }, []);

  const formatTime = (timestamp: number) => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="mt-2">
      {recentSearches.length > 0 && (
        <div className="
          bg-stone-900/80 backdrop-blur-md
          rounded-lg border border-stone-700
          overflow-hidden
        ">
          <div className="px-4 py-2 border-b border-stone-700">
            <h3 className="text-sm font-medium text-stone-400">
              Recent Searches
            </h3>
          </div>
          <ul className="divide-y divide-stone-700">
            {recentSearches.map((search) => (
              <li
                key={`${search.id}-${search.timestamp}`}
                className="
                  px-4 py-2
                  hover:bg-stone-800
                  transition-colors
                  flex items-center justify-between
                "
              >
                <div className="flex items-center space-x-3">
                  <Clock className="h-4 w-4 text-stone-500" />
                  <div>
                    <p className="text-white">{search.query}</p>
                    <p className="text-xs text-stone-500">
                      {formatTime(search.timestamp)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const updatedSearches = recentSearches.filter(
                      s => s.id !== search.id
                    );
                    localStorage.setItem('recentSearches', 
                      JSON.stringify(updatedSearches)
                    );
                    setRecentSearches(updatedSearches);
                    LandingAnalytics.track({
                      name: 'recent_search_remove',
                      properties: { searchId: search.id }
                    });
                  }}
                  className="
                    p-1 rounded-full
                    hover:bg-stone-700
                    transition-colors
                  "
                >
                  <X className="h-4 w-4 text-stone-500" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 