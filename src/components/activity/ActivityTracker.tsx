import React, { useState, useEffect } from 'react';
import { ActivityTrackingService } from '@/services/activity/ActivityTrackingService';
import { SocialIntegrationService } from '@/services/social/SocialIntegrationService';
import { PerformanceAnalyticsService } from '@/services/analytics/PerformanceAnalyticsService';
import type { ActivityMetrics, RealTimeMetrics } from '@/types/activity';
import { PerformanceMetrics } from './PerformanceMetrics';
import { ActivityControls } from './ActivityControls';
import { TrainingIntegration } from './TrainingIntegration';
import { SocialShare } from '../social/SocialShare';

interface ActivityTrackerProps {
  userId: string;
  activityType: string;
  initialPreferences?: any;
  onComplete?: (summary: any) => void;
}

export const ActivityTracker: React.FC<ActivityTrackerProps> = ({
  userId,
  activityType,
  initialPreferences,
  onComplete
}) => {
  // Services
  const trackingService = new ActivityTrackingService();
  const socialService = new SocialIntegrationService();
  const analyticsService = new PerformanceAnalyticsService();

  // State
  const [isTracking, setIsTracking] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentMetrics, setCurrentMetrics] = useState<RealTimeMetrics | null>(null);
  const [socialMetrics, setSocialMetrics] = useState<any>(null);
  const [performanceInsights, setPerformanceInsights] = useState<any>(null);

  // Start tracking
  const handleStart = async () => {
    try {
      const newSessionId = await trackingService.startTracking(
        activityType,
        initialPreferences
      );
      setSessionId(newSessionId);
      setIsTracking(true);
      
      // Initialize social integration
      await socialService.integrateActivity({
        type: activityType,
        userId,
        sessionId: newSessionId
      }, 'friends');
    } catch (error) {
      console.error('Failed to start activity:', error);
    }
  };

  // Stop tracking
  const handleStop = async () => {
    if (!sessionId) return;

    try {
      const summary = await trackingService.stopTracking(sessionId);
      setIsTracking(false);
      setSessionId(null);

      // Generate final analytics
      const insights = await analyticsService.generatePerformanceReport(
        userId,
        'current_session'
      );
      setPerformanceInsights(insights);

      if (onComplete) {
        onComplete(summary);
      }
    } catch (error) {
      console.error('Failed to stop activity:', error);
    }
  };

  // Real-time tracking
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isTracking && sessionId) {
      interval = setInterval(async () => {
        try {
          // Get current location
          const position = await getCurrentPosition();
          
          // Update metrics
          const metrics = await trackingService.trackRealTimeMetrics(
            sessionId,
            {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
          );
          setCurrentMetrics(metrics);

          // Update social metrics
          const social = await socialService.trackSocialMetrics(userId);
          setSocialMetrics(social);
        } catch (error) {
          console.error('Failed to update metrics:', error);
        }
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTracking, sessionId]);

  return (
    <div className="activity-tracker">
      {/* Controls */}
      <ActivityControls
        isTracking={isTracking}
        onStart={handleStart}
        onStop={handleStop}
      />

      {/* Real-time metrics */}
      {currentMetrics && (
        <PerformanceMetrics
          metrics={currentMetrics}
          socialMetrics={socialMetrics}
        />
      )}

      {/* Training integration */}
      <TrainingIntegration
        activityType={activityType}
        currentMetrics={currentMetrics}
      />

      {/* Social sharing */}
      <SocialShare
        metrics={currentMetrics}
        insights={performanceInsights}
      />
    </div>
  );
};

// Helper function to get current position
const getCurrentPosition = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    });
  });
}; 