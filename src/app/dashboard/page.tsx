'use client';

import { useEffect } from 'react';
import { ActivityOverview } from '@/components/dashboard/ActivityOverview';
import { RecentRoutes } from '@/components/dashboard/RecentRoutes';
import { WeatherWidget } from '@/components/dashboard/WeatherWidget';
import { POIHighlights } from '@/components/dashboard/POIHighlights';
import { RealTimeUpdates } from '@/components/dashboard/RealTimeUpdates';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const { session, status } = useAuth();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!session) {
    return null; // Protected by middleware, will redirect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-8">
          <ActivityOverview />
          <RecentRoutes />
          <POIHighlights />
        </div>

        {/* Sidebar - Right Column */}
        <div className="space-y-8">
          <WeatherWidget />
          <RealTimeUpdates />
        </div>
      </div>
    </div>
  );
} 