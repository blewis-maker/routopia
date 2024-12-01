import mapboxgl from 'mapbox-gl';
import { LandingAnalytics } from './analytics';

export const RouteAnimations = {
  // Animate route drawing
  animateRoute: (map: mapboxgl.Map, routeId: string) => {
    let progress = 0;
    const duration = 2000;
    const start = performance.now();

    const animate = (timestamp: number) => {
      const elapsed = timestamp - start;
      progress = Math.min(elapsed / duration, 1);

      map.setPaintProperty(routeId, 'line-dasharray', [0, 2, progress * 2]);
      map.setPaintProperty(routeId, 'line-opacity', progress);
      map.setPaintProperty(`${routeId}-glow`, 'line-opacity', progress * 0.3);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        LandingAnalytics.track({
          name: 'feature_click',
          properties: { feature: 'route_animation_complete' }
        });
      }
    };

    requestAnimationFrame(animate);
  },

  // Pulse effect for route
  pulseRoute: (map: mapboxgl.Map, routeId: string) => {
    let opacity = 0.8;
    let increasing = false;

    const pulse = () => {
      opacity += increasing ? 0.01 : -0.01;

      if (opacity >= 1) {
        increasing = false;
      } else if (opacity <= 0.6) {
        increasing = true;
      }

      map.setPaintProperty(routeId, 'line-opacity', opacity);
      map.setPaintProperty(`${routeId}-glow`, 'line-opacity', opacity * 0.3);

      requestAnimationFrame(pulse);
    };

    requestAnimationFrame(pulse);
  }
}; 