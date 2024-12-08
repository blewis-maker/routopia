import { useMemo } from 'react';
import type { RouteSegment } from '../types/route.types';

export function useElevationFlow(route: RouteSegment) {
  return useMemo(() => {
    if (!route.coordinates || !route.elevation) return [1];

    // Calculate flow speed based on elevation changes
    const elevationChanges = route.coordinates.map((coord, i, arr) => {
      if (i === 0) return 0;
      const prevElevation = arr[i - 1][2] || 0;
      const currentElevation = coord[2] || 0;
      return currentElevation - prevElevation;
    });

    // Normalize flow speed (steeper descent = faster flow)
    const maxChange = Math.max(...elevationChanges.map(Math.abs));
    const normalizedFlow = elevationChanges.map(change => 
      1 + (change / maxChange) * 0.5
    );

    return normalizedFlow;
  }, [route]);
} 