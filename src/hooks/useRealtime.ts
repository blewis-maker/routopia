import { useState, useEffect } from 'react';

export const useRealtime = (routeId: string) => {
  const [isSharing, setIsSharing] = useState(false);
  const [viewers, setViewers] = useState<string[]>([]);

  useEffect(() => {
    // Mock real-time connection
    const interval = setInterval(() => {
      setViewers(prev => [...prev, `User-${Math.random().toString(36).slice(2, 7)}`].slice(-5));
    }, 5000);

    return () => clearInterval(interval);
  }, [routeId]);

  return {
    isSharing,
    setIsSharing,
    viewers,
    shareRoute: () => setIsSharing(true),
    stopSharing: () => setIsSharing(false),
  };
};

export default useRealtime; 