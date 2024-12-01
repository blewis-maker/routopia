import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { ConfigurationPanel } from '@/components/system/ConfigurationPanel';
import { MapProviderSystem } from '@/services/integration/MapProviderSystem';
import { ServiceAdapterFramework } from '@/services/integration/ServiceAdapterFramework';
import { PluginSystem } from '@/services/plugins/PluginSystem';
import { TerrainPlugin } from '@/services/plugins/implementations/TerrainPlugin';

describe('System Configuration Integration', () => {
  let mapSystem: MapProviderSystem;
  let adapterFramework: ServiceAdapterFramework;
  let pluginSystem: PluginSystem;

  beforeEach(() => {
    mapSystem = new MapProviderSystem();
    adapterFramework = new ServiceAdapterFramework();
    pluginSystem = new PluginSystem();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Configuration Management', () => {
    test('should load and save configuration', async () => {
      const saveSpy = vi.spyOn(mapSystem, 'switchProvider');
      
      const { getByText, getByLabelText } = render(
        <ConfigurationPanel
          mapSystem={mapSystem}
          adapterFramework={adapterFramework}
          pluginSystem={pluginSystem}
        />
      );

      // Change map provider
      fireEvent.change(getByLabelText('Map Provider'), {
        target: { value: 'google' }
      });

      // Change performance settings
      fireEvent.change(getByLabelText('Cache Size (MB)'), {
        target: { value: '200' }
      });

      // Save configuration
      fireEvent.click(getByText('Save Configuration'));

      await waitFor(() => {
        expect(saveSpy).toHaveBeenCalledWith('google');
      });
    });

    test('should handle configuration errors', async () => {
      vi.spyOn(mapSystem, 'switchProvider').mockRejectedValue(new Error('Failed to switch provider'));

      const { getByText } = render(
        <ConfigurationPanel
          mapSystem={mapSystem}
          adapterFramework={adapterFramework}
          pluginSystem={pluginSystem}
        />
      );

      fireEvent.click(getByText('Save Configuration'));

      await waitFor(() => {
        expect(getByText('Error: Failed to switch provider')).toBeInTheDocument();
      });
    });
  });

  describe('Plugin Integration', () => {
    test('should handle terrain plugin configuration', async () => {
      const terrainPlugin = new TerrainPlugin();
      await pluginSystem.registerPlugin(terrainPlugin);

      const { getByText, getByLabelText } = render(
        <ConfigurationPanel
          mapSystem={mapSystem}
          adapterFramework={adapterFramework}
          pluginSystem={pluginSystem}
        />
      );

      // Enable terrain plugin
      fireEvent.click(getByText('Terrain Plugin'));

      await waitFor(() => {
        expect(getByText('Terrain: Active')).toBeInTheDocument();
      });

      // Configure terrain settings
      fireEvent.change(getByLabelText('Terrain Exaggeration'), {
        target: { value: '1.5' }
      });

      fireEvent.click(getByText('Save Configuration'));

      await waitFor(() => {
        expect(terrainPlugin.getConfig().exaggeration).toBe(1.5);
      });
    });
  });

  describe('Performance Monitoring', () => {
    test('should track configuration impact', async () => {
      const performanceData: any[] = [];
      const trackSpy = vi.fn((data) => performanceData.push(data));

      vi.spyOn(window, 'performance', 'get').mockReturnValue({
        ...window.performance,
        mark: trackSpy
      });

      const { getByText, getByLabelText } = render(
        <ConfigurationPanel
          mapSystem={mapSystem}
          adapterFramework={adapterFramework}
          pluginSystem={pluginSystem}
        />
      );

      // Change multiple settings
      fireEvent.change(getByLabelText('Update Interval (ms)'), {
        target: { value: '1000' }
      });

      fireEvent.click(getByText('Save Configuration'));

      await waitFor(() => {
        expect(performanceData.length).toBeGreaterThan(0);
        expect(performanceData[0]).toHaveProperty('configurationUpdate');
      });
    });
  });
}); 