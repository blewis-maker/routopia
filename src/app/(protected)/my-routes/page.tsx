'use client';

import { useState } from 'react';
import { RouteCard } from '@/components/routes/RouteCard';
import { RouteFilters } from '@/components/routes/RouteFilters';
import { ActivityMetrics } from '@/types/activities/metrics';
import { Route } from '@/types/route/types';

export default function MyRoutesPage() {
  const [filter, setFilter] = useState<'all' | 'saved' | 'completed'>('all');
  const [activityType, setActivityType] = useState<string | null>(null);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-stone-200">My Routes & Activities</h1>
        <RouteFilters 
          onFilterChange={setFilter}
          onActivityTypeChange={setActivityType}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Route cards will go here */}
      </div>
    </div>
  );
} 