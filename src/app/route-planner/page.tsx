'use client';

import { useState } from 'react';
import { RouteCreator } from '@/components/route/RouteCreator';
import { RoutePreferences } from '@/components/route/RoutePreferences';
import { RoutePreview } from '@/components/route/RoutePreview';
import { RouteVisualization } from '@/components/route/RouteVisualization';
import { RouteInteractionPanel } from '@/components/route/RouteInteractionPanel';
import { useAuth } from '@/hooks/useAuth';

export default function RoutePlannerPage() {
  const [activeRoute, setActiveRoute] = useState(null);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Route Creation */}
          <div className="lg:col-span-1">
            <RoutePreferences />
            <RouteCreator onRouteCreate={setActiveRoute} />
          </div>

          {/* Center Panel - Map Visualization */}
          <div className="lg:col-span-2">
            <RouteVisualization route={activeRoute} />
            <RoutePreview route={activeRoute} />
          </div>
        </div>

        {/* Bottom Panel - Interaction Controls */}
        <div className="mt-8">
          <RouteInteractionPanel 
            route={activeRoute}
            onRouteUpdate={setActiveRoute}
            user={user}
          />
        </div>
      </div>
    </div>
  );
} 