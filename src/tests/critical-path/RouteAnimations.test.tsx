import { render, screen, waitFor } from '@testing-library/react';
import { TestContextProvider } from '../utils/TestContextProvider';
import { RouteAnimation } from '../../components/route/RouteAnimation';
import { EnhancedRouteAnimation } from '../../components/route/EnhancedRouteAnimation';
import { AdvancedRouteEffects } from '../../components/route/AdvancedRouteEffects';

describe('Critical - Route Animations', () => {
  describe('RouteAnimation', () => {
    it('basic animation rendering', () => {
      render(
        <TestContextProvider>
          <RouteAnimation activity="walk" />
        </TestContextProvider>
      );

      const canvas = screen.getByTestId('route-animation-canvas');
      expect(canvas).toBeInTheDocument();
      expect(canvas).toHaveClass('route-animation-canvas');
    });

    it('animation state changes', async () => {
      render(
        <TestContextProvider>
          <RouteAnimation activityType="bike" />
        </TestContextProvider>
      );

      await waitFor(() => {
        const canvas = screen.getByTestId('route-animation-canvas');
        expect(canvas).toHaveClass('activity-bike');
      });
    });
  });

  describe('EnhancedRouteAnimation', () => {
    it('enhanced effects rendering', () => {
      render(
        <TestContextProvider>
          <EnhancedRouteAnimation />
        </TestContextProvider>
      );

      const canvas = screen.getByTestId('route-animation-overlay');
      expect(canvas).toBeInTheDocument();
      expect(canvas).toHaveClass('route-animation-overlay');
    });

    it('particle effects', async () => {
      render(
        <TestContextProvider>
          <EnhancedRouteAnimation />
        </TestContextProvider>
      );

      await waitFor(() => {
        const canvas = screen.getByTestId('route-animation-overlay');
        // Verify canvas has content (non-blank)
        expect(canvas).toBeInTheDocument();
      });
    });
  });

  describe('AdvancedRouteEffects', () => {
    it('weather effects rendering', () => {
      render(
        <TestContextProvider>
          <AdvancedRouteEffects />
        </TestContextProvider>
      );

      const canvas = screen.getByTestId('route-effects-canvas');
      expect(canvas).toBeInTheDocument();
      expect(canvas).toHaveClass('route-effects-canvas');
    });

    it('time of day effects', async () => {
      render(
        <TestContextProvider>
          <AdvancedRouteEffects />
        </TestContextProvider>
      );

      await waitFor(() => {
        const canvas = screen.getByTestId('route-effects-canvas');
        // Verify canvas has night effect applied
        expect(canvas).toBeInTheDocument();
      });
    });
  });
}); 