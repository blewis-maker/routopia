import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { SystemManager } from '@/components/integration/SystemManager';
import { MapProviderSystem } from '@/services/integration/MapProviderSystem';
import { ServiceAdapterFramework } from '@/services/integration/ServiceAdapterFramework';
import { PluginSystem } from '@/services/plugins/PluginSystem';

describe('System Integration Tests', () => {
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

  describe('Map Provider Integration', () => {
    test('should switch map providers successfully', async () => {
      const switchSpy = vi.spyOn(mapSystem, 'switchProvider');
      
      const { getByText } = render(
        <SystemManager
          mapSystem={mapSystem}
          adapterFramework={adapterFramework}
          pluginSystem={pluginSystem}
        />
      );

      fireEvent.click(getByText('Mapbox'));
      
      await waitFor(() => {
        expect(switchSpy).toHaveBeenCalledWith('mapbox');
      });
    });

    test('should handle provider switch errors', async () => {
      vi.spyOn(mapSystem, 'switchProvider').mockRejectedValue(new Error('Switch failed'));
      
      const { getByText } = render(
        <SystemManager
          mapSystem={mapSystem}
          adapterFramework={adapterFramework}
          pluginSystem={pluginSystem}
        />
      );

      fireEvent.click(getByText('Google Maps'));
      
      await waitFor(() => {
        expect(getByText('Error: Switch failed')).toBeInTheDocument();
      });
    });
  });

  describe('Service Adapter Integration', () => {
    test('should set active adapters', async () => {
      const setAdapterSpy = vi.spyOn(adapterFramework, 'setActiveAdapter');
      
      const { getByText } = render(
        <SystemManager
          mapSystem={mapSystem}
          adapterFramework={adapterFramework}
          pluginSystem={pluginSystem}
        />
      );

      fireEvent.click(getByText('Routing Adapter'));
      
      await waitFor(() => {
        expect(setAdapterSpy).toHaveBeenCalled();
      });
    });
  });

  describe('Plugin System Integration', () => {
    test('should activate and deactivate plugins', async () => {
      const activateSpy = vi.spyOn(pluginSystem, 'activatePlugin');
      const deactivateSpy = vi.spyOn(pluginSystem, 'deactivatePlugin');
      
      const { getByText } = render(
        <SystemManager
          mapSystem={mapSystem}
          adapterFramework={adapterFramework}
          pluginSystem={pluginSystem}
        />
      );

      // Test activation
      fireEvent.click(getByText('Test Plugin'));
      await waitFor(() => {
        expect(activateSpy).toHaveBeenCalled();
      });

      // Test deactivation
      fireEvent.click(getByText('Test Plugin'));
      await waitFor(() => {
        expect(deactivateSpy).toHaveBeenCalled();
      });
    });
  });
}); 