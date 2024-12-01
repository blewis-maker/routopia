import React from 'react';
import { ActivitySelector } from '@/components/activity/ActivitySelector';
import { RouteOptions } from '@/components/route/RouteOptions';
import { ShareControls } from '@/components/controls/ShareControls';
import { MapWithControls } from '@/components/map/MapWithControls';
import { RouteBuilder } from '@/components/route/RouteBuilder';
import { AIAssistant } from '@/components/ai/AIAssistant';
import { RouteMetrics } from '@/components/route/RouteMetrics';
import { WeatherInfo } from '@/components/weather/WeatherInfo';
import { SaveOptions } from '@/components/controls/SaveOptions';

export default function RoutePlanningPage() {
  return (
    <div className="route-planning-layout">
      {/* Header */}
      <header className="planning-header">
        <ActivitySelector />
        <RouteOptions />
        <ShareControls />
      </header>

      {/* Main Content */}
      <main className="planning-main">
        <MapWithControls />
        <aside className="planning-sidebar">
          <RouteBuilder />
        </aside>
        <div className="planning-overlay">
          <AIAssistant />
        </div>
      </main>

      {/* Footer */}
      <footer className="planning-footer">
        <RouteMetrics />
        <WeatherInfo />
        <SaveOptions />
      </footer>
    </div>
  );
} 