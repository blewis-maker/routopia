import React, { useState, useCallback, useEffect } from 'react';
import type { ActivityType } from '@/types/routes';
import { RouteDrawing } from './RouteDrawing';
import { RoutePreview } from './RoutePreview';
import { RoutePreferences } from './RoutePreferences';
import { routeService } from '@/services/routeService';

interface Props {
  activityType: ActivityType;
  onRouteCreate: (points: [number, number][]) => void;
  onCancel: () => void;
  mapInstance?: mapboxgl.Map;
}

export const RouteCreator: React.FC<Props> = ({
  activityType,
  onRouteCreate,
  onCancel,
  mapInstance
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnPoints, setDrawnPoints] = useState<[number, number][]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [routeName, setRouteName] = useState('');
  const [preferences, setPreferences] = useState({
    avoid: {
      highways: false,
      tolls: false,
      ferries: false,
      unpaved: false,
      trails: true
    },
    restrictions: {
      elevation: '',
      grade: '',
      distance: '',
      duration: ''
    }
  });

  const handleDrawComplete = (points: [number, number][]) => {
    setDrawnPoints(points);
    setIsDrawing(false);
    setShowPreview(true);
  };

  const handleConfirm = () => {
    onRouteCreate(drawnPoints);
    setShowPreview(false);
  };

  const handleEdit = () => {
    setShowPreview(false);
    setIsDrawing(true);
  };

  const handleAddWaypoint = useCallback(() => {
    // Add waypoint logic
  }, []);

  const handleSaveRoute = async () => {
    try {
      await routeService.saveRoute({
        name: routeName,
        points: drawnPoints,
        preferences
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save route:', error);
    }
  };

  useEffect(() => {
    const initializeLocation = async () => {
      try {
        await routeService.getCurrentLocation();
      } catch (error) {
        console.error('Failed to get current location:', error);
      }
    };
    
    initializeLocation();
  }, []);

  return (
    <div className="route-creator">
      <div 
        data-testid="map-container"
        className="map-container"
      >
        {mapInstance && (
          <div id="map" style={{ width: '100%', height: '100%' }} />
        )}
      </div>

      <div className="route-form">
        <label htmlFor="routeName">
          Route Name
          <input
            id="routeName"
            type="text"
            className="form-input"
            aria-label="Route Name"
            value={routeName}
            onChange={(e) => setRouteName(e.target.value)}
          />
        </label>
        <button 
          aria-label="Add Waypoint"
          onClick={handleAddWaypoint}
        >
          Add Waypoint
        </button>
        <button
          onClick={handleSaveRoute}
          aria-label="Save Route"
          className="save-button"
        >
          Save Route
        </button>
      </div>

      <RouteDrawing
        activityType={activityType}
        isDrawing={isDrawing}
        onDrawComplete={handleDrawComplete}
        onDrawCancel={onCancel}
        mapInstance={mapInstance}
        enableUndo
        snapToRoads
      />
      
      <RoutePreview
        points={drawnPoints}
        activityType={activityType}
        isVisible={showPreview}
        onConfirm={handleConfirm}
        onEdit={handleEdit}
        onCancel={onCancel}
        mapInstance={mapInstance}
      />

      <RoutePreferences
        activityType={activityType}
        preferences={{
          type: 'prefer',
          options: {
            highways: false,
            tolls: false,
            ferries: false,
            unpaved: false,
            trails: true
          },
          restrictions: {
            maxElevation: undefined,
            maxGrade: undefined,
            maxDistance: undefined,
            maxDuration: undefined
          }
        }}
        onChange={() => {}} // Implement preference changes if needed
      />

      {saveSuccess && (
        <div aria-live="polite">Route saved successfully</div>
      )}
    </div>
  );
}; 