import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { AdvancedConfigurationPanel } from '@/components/system/AdvancedConfigurationPanel';
import { AnalyticsPlugin } from '@/services/plugins/implementations/AnalyticsPlugin';
import { PluginSystem } from '@/services/plugins/PluginSystem';

describe('Advanced Features Integration', () => {
  let pluginSystem: PluginSystem;
  let analyticsPlugin: AnalyticsPlugin;

  beforeEach(() => {
    pluginSystem = new PluginSystem();
    analyticsPlugin = new AnalyticsPlugin();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Analytics Integration', () => {
    test('should track complex user interactions', async () => {
      const events: any[] = [];
      vi.spyOn(analyticsPlugin as any, 'sendAnalytics')
        .mockImplementation((data) => events.push(...data));

      await pluginSystem.registerPlugin(analyticsPlugin);
      await pluginSystem.activatePlugin('analytics');

      // Simulate route calculation
      await pluginSystem.emit('route:calculated', {
        distance: 1000,
        duration: 600,
        waypoints: [[0, 0], [1, 1]],
        activePlugins: ['weather', 'traffic']
      });

      // Simulate map interaction
      await pluginSystem.emit('map:moved', {
        type: 'pan',
        zoom: 12,
        center: [0, 0]
      });

      await waitFor(() => {
        expect(events).toHaveLength(2);
        expect(events[0].type).toBe('ROUTE_CALCULATION');
        expect(events[1].type).toBe('MAP_INTERACTION');
      });
    });

    test('should handle analytics batching', async () => {
      const batchSpy = vi.spyOn(analyticsPlugin as any, 'flushEvents');
      
      await pluginSystem.registerPlugin(analyticsPlugin);
      await pluginSystem.activatePlugin('analytics');

      // Generate multiple events
      for (let i = 0; i < 51; i++) {
        await pluginSystem.emit('map:moved', {
          type: 'pan',
          zoom: 12,
          center: [0, 0]
        });
      }

      await waitFor(() => {
        expect(batchSpy).toHaveBeenCalled();
      });
    });
  });

  describe('Advanced Configuration', () => {
    test('should apply complex configuration changes', async () => {
      const onSave = vi.fn();
      const { getByText, getByLabelText } = render(
        <AdvancedConfigurationPanel
          onSave={onSave}
          initialConfig={{
            analytics: {
              enabled: true,
              trackingLevel: 'basic',
              batchSize: 50,
              flushInterval: 30000
            },
            performance: {
              cacheStrategy: 'memory',
              maxCacheSize: 100,
              preloadRadius: 1000,
              concurrentRequests: 5
            },
            plugins: {
              autoUpdate: true,
              loadOrder: [],
              fallbackBehavior: 'disable'
            }
          }}
        />
      );

      // Change multiple settings
      fireEvent.click(getByText('Performance'));
      fireEvent.change(getByLabelText('Cache Strategy'), {
        target: { value: 'hybrid' }
      });

      fireEvent.click(getByText('Analytics'));
      fireEvent.change(getByLabelText('Tracking Level'), {
        target: { value: 'detailed' }
      });

      // Save configuration
      fireEvent.click(getByText('Save Advanced Configuration'));

      await waitFor(() => {
        expect(onSave).toHaveBeenCalled();
      });
    });
  });
}); 