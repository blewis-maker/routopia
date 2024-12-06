import React, { useEffect, useRef, useState } from 'react';
import { ARNavigationService } from '@/services/ar/ARNavigationService';
import type { ARNavigationState, ARNavigationOptions } from '@/types/ar';
import type { RouteSegment } from '@/types/route/types';
import type { GeoLocation } from '@/types/geo';

interface ARNavigationProps {
  route: RouteSegment[];
  currentLocation: GeoLocation;
  onNavigationUpdate?: (state: ARNavigationState) => void;
  onError?: (error: Error) => void;
}

export const ARNavigation: React.FC<ARNavigationProps> = ({
  route,
  currentLocation,
  onNavigationUpdate,
  onError
}) => {
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [navigationState, setNavigationState] = useState<ARNavigationState | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Service instance
  const navigationService = new ARNavigationService();

  // Initialize AR
  useEffect(() => {
    const initializeAR = async () => {
      try {
        await navigationService.initializeAR();
        setIsInitialized(true);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to initialize AR');
        setError(error);
        onError?.(error);
      }
    };

    initializeAR();

    return () => {
      if (navigationState) {
        navigationService.stopARNavigation(navigationState);
      }
    };
  }, []);

  // Start navigation when initialized
  useEffect(() => {
    if (!isInitialized || navigationState) return;

    const startNavigation = async () => {
      try {
        const options: ARNavigationOptions = {
          mappingRadius: 100,
          markerScale: 1,
          routeStyle: {
            width: 2,
            color: '#4CAF50',
            style: 'solid'
          },
          visibility: {
            visibleDistance: 100,
            fadeDistance: 50,
            occlusionEnabled: true,
            heightOffset: 1.6
          }
        };

        const state = await navigationService.startARNavigation(
          currentLocation,
          route,
          options
        );

        setNavigationState(state);
        onNavigationUpdate?.(state);

        // Set up video feed
        if (videoRef.current && state.cameraStream) {
          videoRef.current.srcObject = state.cameraStream;
          await videoRef.current.play();
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to start AR navigation');
        setError(error);
        onError?.(error);
      }
    };

    startNavigation();
  }, [isInitialized, route, currentLocation]);

  // Update navigation state when location changes
  useEffect(() => {
    if (!navigationState) return;

    const updateNavigation = async () => {
      try {
        const updatedState = await navigationService.updateARNavigation(
          navigationState,
          currentLocation
        );

        setNavigationState(updatedState);
        onNavigationUpdate?.(updatedState);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to update AR navigation');
        setError(error);
        onError?.(error);
      }
    };

    updateNavigation();
  }, [currentLocation, navigationState]);

  return (
    <div ref={containerRef} className="ar-navigation relative w-full h-full">
      {/* Camera Feed */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        muted
      />

      {/* AR Overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Error Display */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-red-600 text-white px-4 py-2 rounded">
            {error.message}
          </div>
        </div>
      )}

      {/* Loading State */}
      {!isInitialized && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-white">
            Initializing AR...
          </div>
        </div>
      )}

      {/* Navigation Controls */}
      {navigationState && (
        <div className="absolute bottom-4 left-4 right-4 flex justify-between">
          <button
            className="bg-white bg-opacity-90 px-4 py-2 rounded-full shadow"
            onClick={() => {
              if (navigationState) {
                navigationService.stopARNavigation(navigationState);
                setNavigationState(null);
              }
            }}
          >
            Exit AR
          </button>
        </div>
      )}
    </div>
  );
}; 