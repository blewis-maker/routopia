'use client';

import { useEffect } from 'react';
import { serviceInitializer } from '@/lib/services/initServices';

export function ServiceInitializer() {
  useEffect(() => {
    if (!serviceInitializer.isInitialized()) {
      serviceInitializer.initialize()
        .catch(error => {
          console.error('Failed to initialize services:', error);
        });
    }
  }, []);

  return null;
} 