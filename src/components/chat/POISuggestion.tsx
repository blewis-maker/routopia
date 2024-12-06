import { POIRecommendation } from '@/mcp/types/mcp.types';
import { MapPin, Star } from 'lucide-react';

interface POISuggestionProps {
  pois: POIRecommendation[];
}

export function POISuggestion({ pois }: POISuggestionProps) {
  return (
    <div className="mt-2 p-2 bg-stone-700/50 rounded-lg text-sm">
      <div className="font-medium mb-1">Points of Interest</div>
      <div className="space-y-2">
        {pois.slice(0, 3).map((poi) => (
          <div key={poi.id} className="flex items-start gap-2 text-stone-300">
            <MapPin className="w-4 h-4 mt-0.5 text-teal-500" />
            <div className="flex-1">
              <div className="font-medium">{poi.name}</div>
              <div className="text-xs text-stone-400 flex items-center gap-1">
                <Star className="w-3 h-3 fill-current text-yellow-500" />
                <span>{poi.rating}</span>
                <span>•</span>
                <span>{poi.distance}km away</span>
                {poi.openNow && (
                  <>
                    <span>•</span>
                    <span className="text-emerald-500">Open now</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        {pois.length > 3 && (
          <div className="text-xs text-stone-400">
            +{pois.length - 3} more points of interest
          </div>
        )}
      </div>
    </div>
  );
} 