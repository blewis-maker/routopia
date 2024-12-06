import React, { useEffect, useState, useCallback } from 'react';
import { RouteSegment, RouteMetrics } from '@/types/route/types';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Toast } from '@/components/common/Toast';
import { Spinner } from '@/components/common/Spinner';
import { Badge } from '@/components/common/Badge';
import { formatDistance, formatDuration, formatElevation } from '@/utils/formatters';
import mapboxgl from 'mapbox-gl';

interface Props {
  segments: RouteSegment[];
  currentSegment: RouteSegment | null;
  isVisible: boolean;
  onConfirm: () => void;
  onEdit: () => void;
  onCancel: () => void;
  mapInstance?: mapboxgl.Map;
}

export const RoutePreview: React.FC<Props> = ({
  segments,
  currentSegment,
  isVisible,
  onConfirm,
  onEdit,
  onCancel,
  mapInstance
}) => {
  const [selectedSegment, setSelectedSegment] = useState<RouteSegment | null>(currentSegment);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mapLayers, setMapLayers] = useState<string[]>([]);

  const calculateTotalMetrics = useCallback((): RouteMetrics => {
    return segments.reduce((total, segment) => ({
      distance: total.distance + segment.distance,
      duration: total.duration + segment.duration,
      elevation: {
        gain: total.elevation.gain + segment.metrics.elevation.gain,
        loss: total.elevation.loss + segment.metrics.elevation.loss,
        profile: [...total.elevation.profile, ...segment.metrics.elevation.profile]
      },
      safety: (total.safety + segment.metrics.safety) / 2,
      weatherImpact: segment.metrics.weatherImpact !== null 
        ? ((total.weatherImpact || 0) + segment.metrics.weatherImpact) / 2 
        : total.weatherImpact,
      terrainDifficulty: segment.metrics.terrainDifficulty,
      surfaceType: segment.metrics.surfaceType,
      trafficImpact: segment.metrics.trafficImpact !== undefined 
        ? ((total.trafficImpact || 0) + segment.metrics.trafficImpact) / 2 
        : total.trafficImpact,
      scenicScore: segment.metrics.scenicScore !== undefined 
        ? ((total.scenicScore || 0) + segment.metrics.scenicScore) / 2 
        : total.scenicScore
    }), {
      distance: 0,
      duration: 0,
      elevation: { gain: 0, loss: 0, profile: [] },
      safety: 0,
      weatherImpact: null,
      terrainDifficulty: 'easy',
      surfaceType: 'unknown',
      trafficImpact: undefined,
      scenicScore: undefined
    } as RouteMetrics);
  }, [segments]);

  const drawSegmentOnMap = useCallback(async (segment: RouteSegment, color: string) => {
    if (!mapInstance) {
      setError('Map is not initialized');
      return;
    }

    try {
      setIsLoading(true);
      const layerId = `segment-${segment.id}`;
      const sourceId = `source-${segment.id}`;

      // Remove existing layer and source if they exist
      if (mapInstance.getLayer(layerId)) {
        mapInstance.removeLayer(layerId);
      }
      if (mapInstance.getSource(sourceId)) {
        mapInstance.removeSource(sourceId);
      }

      // Add new source and layer
      mapInstance.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [
              [segment.startPoint.longitude, segment.startPoint.latitude],
              [segment.endPoint.longitude, segment.endPoint.latitude]
            ]
          }
        }
      });

      mapInstance.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': color,
          'line-width': 3
        }
      });

      setMapLayers(prev => [...prev, layerId]);
      setError(null);
    } catch (err) {
      console.error('Error drawing segment:', err);
      setError('Failed to draw route on map');
    } finally {
      setIsLoading(false);
    }
  }, [mapInstance]);

  const cleanupMapDrawings = useCallback(() => {
    if (!mapInstance) return;

    mapLayers.forEach(layerId => {
      if (mapInstance.getLayer(layerId)) {
        mapInstance.removeLayer(layerId);
      }
      const sourceId = layerId.replace('segment-', 'source-');
      if (mapInstance.getSource(sourceId)) {
        mapInstance.removeSource(sourceId);
      }
    });

    setMapLayers([]);
  }, [mapInstance, mapLayers]);

  useEffect(() => {
    if (!isVisible || !mapInstance) return;

    const drawRouteOnMap = async () => {
      try {
        setIsLoading(true);
        cleanupMapDrawings();

        // Draw all segments
        await Promise.all(segments.map((segment, index) => {
          const color = index === segments.length - 1 ? '#FF4444' : '#4444FF';
          return drawSegmentOnMap(segment, color);
        }));

        // Fit map bounds to include all segments
        const bounds = new mapboxgl.LngLatBounds();
        segments.forEach(segment => {
          bounds.extend([segment.startPoint.longitude, segment.startPoint.latitude]);
          bounds.extend([segment.endPoint.longitude, segment.endPoint.latitude]);
        });
        mapInstance.fitBounds(bounds, { padding: 50 });
      } catch (err) {
        console.error('Error drawing route:', err);
        setError('Failed to display route preview');
      } finally {
        setIsLoading(false);
      }
    };

    drawRouteOnMap();

    return () => {
      cleanupMapDrawings();
    };
  }, [isVisible, segments, mapInstance, drawSegmentOnMap, cleanupMapDrawings]);

  if (!isVisible) return null;

  const totalMetrics = calculateTotalMetrics();

  return (
    <ErrorBoundary>
      <div className="route-preview">
        <h3>Route Preview</h3>
        
        {isLoading && <Spinner />}
        
        <div className="segments-list">
          {segments.map((segment, index) => (
            <div
              key={segment.id}
              className={`segment-item ${selectedSegment?.id === segment.id ? 'selected' : ''}`}
              onClick={() => setSelectedSegment(segment)}
            >
              <h4>Segment {index + 1}</h4>
              <div className="segment-details">
                <div className="segment-header">
                  <Badge type={segment.type} />
                  <span className="distance">{formatDistance(segment.distance)}</span>
                </div>
                <div className="metrics">
                  <div className="metric">
                    <span>Duration:</span>
                    <span>{formatDuration(segment.duration)}</span>
                  </div>
                  <div className="metric">
                    <span>Elevation:</span>
                    <span>+{formatElevation(segment.metrics.elevation.gain)} / -{formatElevation(segment.metrics.elevation.loss)}</span>
                  </div>
                  <div className="metric">
                    <span>Safety:</span>
                    <span className={`safety-score ${segment.metrics.safety >= 0.7 ? 'good' : 'warning'}`}>
                      {Math.round(segment.metrics.safety * 100)}%
                    </span>
                  </div>
                  {segment.metrics.weatherImpact !== null && (
                    <div className="metric">
                      <span>Weather Impact:</span>
                      <span className={`impact-score ${segment.metrics.weatherImpact <= 0.3 ? 'good' : 'warning'}`}>
                        {Math.round(segment.metrics.weatherImpact * 100)}%
                      </span>
                    </div>
                  )}
                  <div className="metric">
                    <span>Terrain:</span>
                    <span>{segment.metrics.terrainDifficulty}</span>
                  </div>
                  <div className="metric">
                    <span>Surface:</span>
                    <span>{segment.metrics.surfaceType}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="total-metrics">
          <h4>Total Route Metrics</h4>
          <div className="metrics-grid">
            <div className="metric">
              <span>Total Distance:</span>
              <span>{formatDistance(totalMetrics.distance)}</span>
            </div>
            <div className="metric">
              <span>Total Duration:</span>
              <span>{formatDuration(totalMetrics.duration)}</span>
            </div>
            <div className="metric">
              <span>Total Elevation:</span>
              <span>+{formatElevation(totalMetrics.elevation.gain)} / -{formatElevation(totalMetrics.elevation.loss)}</span>
            </div>
            <div className="metric">
              <span>Average Safety:</span>
              <span className={`safety-score ${totalMetrics.safety >= 0.7 ? 'good' : 'warning'}`}>
                {Math.round(totalMetrics.safety * 100)}%
              </span>
            </div>
          </div>
        </div>

        <div className="actions">
          <button 
            onClick={onEdit} 
            className="edit-button"
            disabled={isLoading}
          >
            Edit Route
          </button>
          <button 
            onClick={onConfirm} 
            className="confirm-button"
            disabled={isLoading || segments.length === 0}
          >
            Confirm Route
          </button>
          <button 
            onClick={onCancel} 
            className="cancel-button"
            disabled={isLoading}
          >
            Cancel
          </button>
        </div>

        {error && (
          <Toast 
            type="error" 
            message={error} 
            onClose={() => setError(null)} 
          />
        )}

        <style jsx>{`
          .route-preview {
            padding: 1rem;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            max-width: 800px;
            margin: 0 auto;
          }

          .segments-list {
            margin: 1rem 0;
            max-height: 400px;
            overflow-y: auto;
          }

          .segment-item {
            padding: 1rem;
            margin: 0.5rem 0;
            border: 1px solid #ddd;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s;
          }

          .segment-item:hover {
            background: #f5f5f5;
          }

          .segment-item.selected {
            border-color: #4444FF;
            background: #f0f0ff;
          }

          .segment-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
          }

          .segment-details {
            margin-top: 0.5rem;
          }

          .metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 0.5rem;
            margin-top: 0.5rem;
            padding-top: 0.5rem;
            border-top: 1px solid #eee;
          }

          .metric {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.25rem 0;
          }

          .safety-score,
          .impact-score {
            font-weight: 500;
          }

          .good {
            color: #22c55e;
          }

          .warning {
            color: #f59e0b;
          }

          .total-metrics {
            margin: 1rem 0;
            padding: 1rem;
            background: #f5f5f5;
            border-radius: 4px;
          }

          .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-top: 0.5rem;
          }

          .actions {
            display: flex;
            gap: 1rem;
            margin-top: 1rem;
          }

          button {
            padding: 0.5rem 1rem;
            border-radius: 4px;
            border: none;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.2s;
            flex: 1;
          }

          button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .edit-button {
            background: #4444FF;
            color: white;
          }

          .confirm-button {
            background: #22c55e;
            color: white;
          }

          .cancel-button {
            background: #ef4444;
            color: white;
          }

          button:hover:not(:disabled) {
            opacity: 0.9;
          }
        `}</style>
      </div>
    </ErrorBoundary>
  );
};

// Helper functions from previous component... 