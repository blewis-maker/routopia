import React, { useState } from 'react';
import type { RealTimeMetrics } from '@/types/activity';
import type { AnalyticsReport } from '@/types/analytics';

interface SocialShareProps {
  metrics: RealTimeMetrics | null;
  insights: AnalyticsReport | null;
}

export const SocialShare: React.FC<SocialShareProps> = ({
  metrics,
  insights
}) => {
  const [shareType, setShareType] = useState<'metrics' | 'insights'>('metrics');
  const [visibility, setVisibility] = useState<'friends' | 'public'>('friends');

  const handleShare = async () => {
    try {
      const content = formatShareContent(metrics, insights, shareType);
      await shareActivity(content, visibility);
    } catch (error) {
      console.error('Failed to share activity:', error);
    }
  };

  return (
    <div className="social-share bg-stone-800 rounded-lg p-4 space-y-4">
      <h3 className="text-xl font-semibold text-white">Share Your Activity</h3>

      {/* Share Type Selection */}
      <div className="flex gap-4">
        <button
          onClick={() => setShareType('metrics')}
          className={`px-4 py-2 rounded ${
            shareType === 'metrics'
              ? 'bg-blue-600 text-white'
              : 'bg-stone-700 text-stone-300'
          }`}
        >
          Share Metrics
        </button>
        <button
          onClick={() => setShareType('insights')}
          className={`px-4 py-2 rounded ${
            shareType === 'insights'
              ? 'bg-blue-600 text-white'
              : 'bg-stone-700 text-stone-300'
          }`}
        >
          Share Insights
        </button>
      </div>

      {/* Visibility Selection */}
      <div className="flex gap-4">
        <button
          onClick={() => setVisibility('friends')}
          className={`px-4 py-2 rounded ${
            visibility === 'friends'
              ? 'bg-green-600 text-white'
              : 'bg-stone-700 text-stone-300'
          }`}
        >
          Friends Only
        </button>
        <button
          onClick={() => setVisibility('public')}
          className={`px-4 py-2 rounded ${
            visibility === 'public'
              ? 'bg-green-600 text-white'
              : 'bg-stone-700 text-stone-300'
          }`}
        >
          Public
        </button>
      </div>

      {/* Preview */}
      <div className="bg-stone-700 rounded p-4">
        <h4 className="text-lg font-medium text-white mb-2">Preview</h4>
        <div className="space-y-2">
          {shareType === 'metrics' && metrics && (
            <MetricsPreview metrics={metrics} />
          )}
          {shareType === 'insights' && insights && (
            <InsightsPreview insights={insights} />
          )}
        </div>
      </div>

      {/* Share Button */}
      <button
        onClick={handleShare}
        disabled={!metrics && !insights}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 
                 disabled:bg-stone-600 disabled:cursor-not-allowed"
      >
        Share Activity
      </button>
    </div>
  );
};

// Helper Components
const MetricsPreview: React.FC<{ metrics: RealTimeMetrics }> = ({ metrics }) => (
  <div className="text-stone-300">
    <p>Distance: {formatDistance(metrics.distance)}</p>
    <p>Duration: {formatDuration(metrics.duration)}</p>
    <p>Pace: {formatPace(metrics.pace)}</p>
    {metrics.elevation && (
      <p>Elevation: +{metrics.elevation.gain}m/-{metrics.elevation.loss}m</p>
    )}
  </div>
);

const InsightsPreview: React.FC<{ insights: AnalyticsReport }> = ({ insights }) => (
  <div className="text-stone-300">
    <p>Performance Score: {insights.metrics.performance}</p>
    <p>Improvement: {insights.trends.improvement}%</p>
    {insights.recommendations.slice(0, 2).map((rec, i) => (
      <p key={i}>💡 {rec}</p>
    ))}
  </div>
);

// Helper Functions
const formatShareContent = (
  metrics: RealTimeMetrics | null,
  insights: AnalyticsReport | null,
  type: 'metrics' | 'insights'
) => {
  if (type === 'metrics' && metrics) {
    return {
      type: 'activity_metrics',
      data: {
        distance: metrics.distance,
        duration: metrics.duration,
        pace: metrics.pace,
        elevation: metrics.elevation
      }
    };
  }

  if (type === 'insights' && insights) {
    return {
      type: 'activity_insights',
      data: {
        performance: insights.metrics.performance,
        improvement: insights.trends.improvement,
        recommendations: insights.recommendations.slice(0, 2)
      }
    };
  }

  throw new Error('Invalid share content');
};

const shareActivity = async (content: any, visibility: string) => {
  const response = await fetch('/api/social/share', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, visibility })
  });

  if (!response.ok) {
    throw new Error('Failed to share activity');
  }

  return response.json();
};

const formatDistance = (meters: number) => 
  `${(meters / 1000).toFixed(2)} km`;

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};

const formatPace = (pace: string) => pace; 