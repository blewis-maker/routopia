'use client';

import { useEffect, useState } from 'react';
import { ServiceContainer } from '@/services/ServiceContainer';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';

export default function ServiceTestPage() {
  const [container, setContainer] = useState<ServiceContainer | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const { isLoaded } = useGoogleMaps();

  useEffect(() => {
    async function initServices() {
      if (!isLoaded) return;
      
      try {
        const instance = await ServiceContainer.getInstance();
        setContainer(instance);
      } catch (err) {
        console.error('Failed to initialize services:', err);
        setError(err instanceof Error ? err : new Error('Failed to initialize services'));
      }
    }

    initServices();
  }, [isLoaded]);

  if (!isLoaded || !container) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-t-teal-500 border-stone-700 rounded-full animate-spin mb-4" />
          <p>Loading services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        Error initializing services: {error.message}
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Services Status</h1>
      <div className="space-y-2">
        <div>Maps Service: Initialized ✅</div>
        <div>Weather Service: Initialized ✅</div>
        <div>Route Manager: Initialized ✅</div>
      </div>
    </div>
  );
} 