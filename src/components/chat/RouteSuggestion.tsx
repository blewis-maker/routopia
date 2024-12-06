import { RouteContext } from '@/mcp/types/mcp.types';

interface RouteSuggestionProps {
  route: RouteContext;
}

export function RouteSuggestion({ route }: RouteSuggestionProps) {
  return (
    <div className="mt-2 p-2 bg-stone-700/50 rounded-lg text-sm">
      <div className="font-medium mb-1">Suggested Route</div>
      <div className="space-y-1 text-stone-300">
        <div>From: {route.startLocation}</div>
        <div>To: {route.endLocation}</div>
        <div className="flex gap-2 text-xs text-stone-400">
          <span>{route.distance}km</span>
          <span>•</span>
          <span>{Math.round(route.duration / 60)} min</span>
          <span>•</span>
          <span>{route.routeType}</span>
        </div>
      </div>
    </div>
  );
} 