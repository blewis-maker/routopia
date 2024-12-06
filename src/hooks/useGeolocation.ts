import { useState, useEffect } from 'react';

interface Location {
  lat: number;
  lng: number;
}

interface GeolocationState {
  location: Location | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    loading: true
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({
        location: null,
        error: 'Geolocation is not supported',
        loading: false
      });
      return;
    }

    const handleSuccess = (position: GeolocationPosition) => {
      setState({
        location: {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        },
        error: null,
        loading: false
      });
    };

    const handleError = (error: GeolocationPositionError) => {
      setState({
        location: null,
        error: error.message,
        loading: false
      });
    };

    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };

    const watchId = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      options
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return state;
} 