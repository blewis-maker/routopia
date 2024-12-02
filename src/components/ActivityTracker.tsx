import React, { useState, useEffect, useCallback } from 'react';
import type { ActivityDetails } from '../types/activities-enhanced';
import { getRealtimeMetrics } from '../services/tracking';
import { getCurrentWeather } from '../services/weather';
import { getDaylightInfo } from '../services/daylight';
import { formatDistance, formatDuration } from '../utils/formatters';

interface ActivityTrackerProps {
  initialActivity: ActivityDetails;
  onComplete?: (summary: ActivityDetails) => void;
}

export const ActivityTracker: React.FC<ActivityTrackerProps> = ({
  initialActivity,
  onComplete
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [currentMetrics, setCurrentMetrics] = useState<any>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [summary, setSummary] = useState<any>(null);

  // Environmental monitoring
  const checkEnvironmentalConditions = useCallback(async () => {
    const newWarnings: string[] = [];
    
    // Check weather conditions
    const weather = await getCurrentWeather();
    if (weather.temperature > initialActivity.constraints.weather.maxTemp) {
      newWarnings.push('Temperature Warning: Conditions exceed recommended maximum');
    }
    if (weather.windSpeed > initialActivity.constraints.weather.maxWind) {
      newWarnings.push('Wind Warning: Speed exceeds recommended maximum');
    }
    if (!initialActivity.constraints.weather.conditions.includes(weather.condition)) {
      newWarnings.push('Weather Condition Warning: Current conditions not recommended');
    }

    // Check daylight
    const daylight = await getDaylightInfo();
    if (initialActivity.constraints.daylight.required && !daylight.isDaytime) {
      newWarnings.push('Insufficient daylight for this activity');
    }
    if (daylight.remainingDaylight < (initialActivity.constraints.daylight.minimumHours || 0)) {
      newWarnings.push(`Less than ${initialActivity.constraints.daylight.minimumHours}h of daylight remaining`);
    }

    setWarnings(newWarnings);
  }, [initialActivity]);

  // Metrics tracking
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRecording) {
      interval = setInterval(async () => {
        const metrics = await getRealtimeMetrics();
        setCurrentMetrics(metrics);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  // Environmental monitoring
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRecording) {
      checkEnvironmentalConditions();
      interval = setInterval(checkEnvironmentalConditions, 300000); // Check every 5 minutes
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, checkEnvironmentalConditions]);

  const handleStart = () => {
    setIsRecording(true);
    setWarnings([]);
    setCurrentMetrics(null);
    setSummary(null);
  };

  const handleStop = () => {
    setIsRecording(false);
    const activitySummary = {
      ...initialActivity,
      metrics: {
        ...initialActivity.metrics,
        actual: {
          distance: currentMetrics.distance,
          duration: currentMetrics.duration,
          elevationGain: currentMetrics.elevation,
          averageSpeed: currentMetrics.speed
        }
      }
    };
    setSummary(activitySummary);
    if (onComplete) onComplete(activitySummary);
  };

  return (
    <div className="activity-tracker">
      {/* Status and Controls */}
      <div className="tracker-controls">
        {!isRecording && !summary && (
          <button onClick={handleStart}>Start</button>
        )}
        {isRecording && (
          <>
            <div className="recording-status">Recording</div>
            <div className="timer" data-testid="timer">
              {formatDuration(currentMetrics?.duration || 0)}
            </div>
            <button onClick={handleStop}>Stop</button>
          </>
        )}
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="warnings">
          {warnings.map((warning, index) => (
            <div key={index} className="warning-message">
              {warning}
            </div>
          ))}
        </div>
      )}

      {/* Current Metrics */}
      {isRecording && currentMetrics && (
        <div className="current-metrics">
          <div>{currentMetrics.speed.toFixed(1)} km/h</div>
          <div>{currentMetrics.elevation}m</div>
          <div>{formatDistance(currentMetrics.distance * 1000)}</div>
        </div>
      )}

      {/* Activity Summary */}
      {summary && (
        <div className="activity-summary">
          <h3>Summary</h3>
          <div>{formatDistance(summary.metrics.actual.distance * 1000)}</div>
          <div>{formatDuration(summary.metrics.actual.duration * 60)}</div>
          <div>{summary.metrics.actual.elevationGain}m elevation gain</div>
          <div>{summary.metrics.actual.averageSpeed} km/h</div>
        </div>
      )}
    </div>
  );
}; 