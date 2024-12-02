import React from 'react';
import { ActivityControls } from '../activity/ActivityControls';
import { RealTimeUpdates } from '../realtime/RealTimeUpdates';
import { FeedbackInterface } from '../feedback/FeedbackInterface';
import { RouteVisualizationComposite } from '../visualization/RouteVisualizationComposite';

export const MainApplicationView: React.FC = () => {
  return (
    <div className="app-layout" data-testid="main-application">
      {/* Left Panel */}
      <div className="left-panel">
        <ActivityControls />
      </div>

      {/* Center Panel */}
      <div className="center-panel">
        <RouteVisualizationComposite />
        <RealTimeUpdates />
      </div>

      {/* Right Panel */}
      <div className="right-panel">
        <FeedbackInterface />
      </div>
    </div>
  );
}; 