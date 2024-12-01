import { useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { RouteAnimations } from '@/utils/map-animations';

interface RouteAlternative {
  id: string;
  name: string;
  coordinates: [number, number][];
  color: string;
  difficulty: 'easy' | 'moderate' | 'hard';
}

const alternatives: RouteAlternative[] = [
  {
    id: 'route-1',
    name: 'Scenic Route',
    coordinates: [
      [-74.5, 40],
      [-74.45, 40.05],
      [-74.4, 40.03],
      [-74.35, 40.06]
    ],
    color: '#2dd4bf',
    difficulty: 'moderate'
  },
  {
    id: 'route-2',
    name: 'Quick Route',
    coordinates: [
      [-74.5, 40],
      [-74.42, 40.02],
      [-74.35, 40.06]
    ],
    color: '#34d399',
    difficulty: 'easy'
  }
];

export function RouteAlternatives({ map }: { map: mapboxgl.Map | null }) {
  const [activeRoute, setActiveRoute] = useState<string>('route-1');

  const switchRoute = (routeId: string) => {
    if (!map) return;
    
    // Fade out current route
    map.setPaintProperty(activeRoute, 'line-opacity', 0);
    map.setPaintProperty(`${activeRoute}-glow`, 'line-opacity', 0);

    // Fade in new route
    setActiveRoute(routeId);
    RouteAnimations.animateRoute(map, routeId);
  };

  return (
    <div className="
      absolute top-4 left-1/2 -translate-x-1/2
      flex space-x-2
    ">
      {alternatives.map(route => (
        <button
          key={route.id}
          onClick={() => switchRoute(route.id)}
          className={`
            px-3 py-1.5 rounded-full
            text-sm font-medium
            transition-all duration-300
            ${activeRoute === route.id
              ? 'bg-teal-500 text-white'
              : 'bg-stone-900/80 text-white/80 hover:bg-stone-800'
            }
          `}
        >
          {route.name}
        </button>
      ))}
    </div>
  );
} 