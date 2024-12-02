import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { PluginManager } from '@/components/plugins/PluginManager';
import { PluginSystem } from '@/services/plugins/PluginSystem';
import { TrafficPlugin } from '@/services/plugins/implementations/TrafficPlugin';
import { WeatherPlugin } from '@/services/plugins/implementations/WeatherPlugin';

interface Plugin {
  name: string;
  version: string;
  dependencies?: string[];
  initialize: () => void;
  activate: () => void;
  deactivate: () => void;
}

describe('Plugin System Integration', () => {
  let pluginSystem: PluginSystem;
  let trafficPlugin: TrafficPlugin;
  let weatherPlugin: WeatherPlugin;

  beforeEach(async () => {
    pluginSystem = new PluginSystem();
    trafficPlugin = new TrafficPlugin();
    weatherPlugin = new WeatherPlugin();

    // Register test plugins
    await pluginSystem.registerPlugin(trafficPlugin);
    await pluginSystem.registerPlugin(weatherPlugin);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Plugin Lifecycle', () => {
    test('should handle plugin activation/deactivation', async () => {
      const { getByText } = render(
        <PluginManager pluginSystem={pluginSystem} />
      );

      // Test activation
      fireEvent.click(getByText('Activate'));
      await waitFor(() => {
        expect(getByText('Deactivate')).toBeInTheDocument();
      });

      // Test deactivation
      fireEvent.click(getByText('Deactivate'));
      await waitFor(() => {
        expect(getByText('Activate')).toBeInTheDocument();
      });
    });

    test('should handle dependency resolution', async () => {
      const dependentPlugin: Plugin = {
        name: 'dependent-plugin',
        version: '1.0.0',
        dependencies: ['traffic', 'weather'],
        initialize: vi.fn(),
        activate: vi.fn(),
        deactivate: vi.fn()
      };

      await pluginSystem.registerPlugin(dependentPlugin);

      const { getByText } = render(
        <PluginManager pluginSystem={pluginSystem} />
      );

      // Try to activate dependent plugin without dependencies
      fireEvent.click(getByText(/dependent-plugin/));
      
      await waitFor(() => {
        expect(getByText(/Missing dependencies/)).toBeInTheDocument();
      });
    });
  });

  describe('Plugin Data Integration', () => {
    test('should integrate traffic and weather data', async () => {
      // Activate both plugins
      await pluginSystem.activatePlugin('traffic');
      await pluginSystem.activatePlugin('weather');

      // Mock data updates
      const trafficUpdate = vi.spyOn(trafficPlugin as any, 'updateTrafficData');
      const weatherUpdate = vi.spyOn(weatherPlugin as any, 'updateWeatherData');

      // Trigger updates
      await pluginSystem.emit('map:update', {});

      expect(trafficUpdate).toHaveBeenCalled();
      expect(weatherUpdate).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('should handle plugin initialization errors', async () => {
      const errorPlugin: Plugin = {
        name: 'error-plugin',
        version: '1.0.0',
        initialize: () => { throw new Error('Init failed'); },
        activate: vi.fn(),
        deactivate: vi.fn()
      };

      await pluginSystem.registerPlugin(errorPlugin);

      const { getByText } = render(
        <PluginManager pluginSystem={pluginSystem} />
      );

      expect(getByText('Init failed')).toBeInTheDocument();
    });
  });
}); 