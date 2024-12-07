import React, { useEffect, useState } from 'react';
import '@/styles/components/features/AdvancedFeatures.css';
import type { UserPreferences, FeatureFlags, WeatherAlert } from '../types/advanced';
import { getWeatherAlerts } from '../services/weather';
import { optimizeRoute } from '../services/routing';
import type { Route } from '../types/routing';

interface AdvancedFeaturesProps {
  preferences: UserPreferences;
  featureFlags: FeatureFlags;
  initialRoute: Route;
}

export const AdvancedFeatures: React.FC<AdvancedFeaturesProps> = ({
  preferences,
  featureFlags,
  initialRoute
}) => {
  const [route, setRoute] = useState<Route>(initialRoute);
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>('');

  useEffect(() => {
    if (featureFlags.weatherAlerts) {
      getWeatherAlerts().then(setWeatherAlerts);
    }
  }, [featureFlags.weatherAlerts]);

  const handleOptimizeRoute = async () => {
    setIsOptimizing(true);
    try {
      const optimizedRoute = await optimizeRoute(route, preferences);
      setRoute(optimizedRoute);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleShareRoute = () => {
    const url = `${window.location.origin}/route/${route.id}`;
    setShareUrl(url);
  };

  return (
    <div className="advanced-features">
      {/* Route Optimization */}
      <section>
        <button 
          onClick={handleOptimizeRoute}
          disabled={isOptimizing}
        >
          Optimize Route
        </button>
        {route.elevation.gain > preferences.maxElevationGain && (
          <div className="warning">
            <p>Elevation exceeds preference</p>
            <p>Alternative routes available</p>
          </div>
        )}
        {isOptimizing && <p>Optimizing route...</p>}
        {!isOptimizing && route.optimized && (
          <>
            <p>Route optimized</p>
            {preferences.avoidHighways && <p>Avoiding highways</p>}
            {preferences.preferScenic && <p>Scenic preference applied</p>}
          </>
        )}
      </section>

      {/* Experimental Features */}
      {featureFlags.experimentalRouting && (
        <section data-testid="experimental-routing">
          <h3>AI-Powered Optimization</h3>
          {/* Experimental routing features */}
        </section>
      )}

      {/* Weather Alerts */}
      {weatherAlerts.length > 0 && (
        <section className="weather-alerts">
          {weatherAlerts.map((alert, index) => (
            <div key={index} className="alert">
              <p>Storm Warning</p>
              <p>Affects {alert.affectedSegments.length} segments</p>
            </div>
          ))}
        </section>
      )}

      {/* Offline Mode */}
      {featureFlags.offlineMode && (
        <section className="offline-mode">
          <p>Offline mode active</p>
          <p>Cached route data</p>
        </section>
      )}

      {/* Social Sharing */}
      {featureFlags.socialSharing && (
        <section className="sharing">
          <button onClick={handleShareRoute}>Share Route</button>
          {shareUrl && (
            <div className="share-options">
              <p>Share Options</p>
              <button>Copy Link</button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}; 