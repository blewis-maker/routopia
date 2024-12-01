import React, { useState, useEffect } from 'react';
import { MapProviderSystem } from '@/services/integration/MapProviderSystem';
import { ServiceAdapterFramework } from '@/services/integration/ServiceAdapterFramework';
import { PluginSystem } from '@/services/plugins/PluginSystem';
import { Section, Button, StatusIndicator } from '@/components/common/styles';

interface Props {
  mapSystem: MapProviderSystem;
  adapterFramework: ServiceAdapterFramework;
  pluginSystem: PluginSystem;
}

export const SystemManager: React.FC<Props> = ({
  mapSystem,
  adapterFramework,
  pluginSystem
}) => {
  const [activeProvider, setActiveProvider] = useState<string>('');
  const [activeAdapters, setActiveAdapters] = useState<Record<string, string>>({});
  const [activePlugins, setActivePlugins] = useState<Set<string>>(new Set());
  const [systemStatus, setSystemStatus] = useState<Record<string, 'active' | 'inactive' | 'error'>>({});

  useEffect(() => {
    initializeSystems();
  }, []);

  const initializeSystems = async () => {
    try {
      // Initialize and load system states
      updateSystemStatuses();
    } catch (error) {
      console.error('Failed to initialize systems:', error);
    }
  };

  const handleProviderSwitch = async (providerName: string) => {
    try {
      await mapSystem.switchProvider(providerName);
      setActiveProvider(providerName);
      updateSystemStatuses();
    } catch (error) {
      console.error(`Failed to switch to provider ${providerName}:`, error);
    }
  };

  const handleAdapterChange = async (type: string, adapterName: string) => {
    try {
      await adapterFramework.setActiveAdapter(type, adapterName);
      setActiveAdapters(prev => ({ ...prev, [type]: adapterName }));
      updateSystemStatuses();
    } catch (error) {
      console.error(`Failed to set adapter ${adapterName}:`, error);
    }
  };

  const handlePluginToggle = async (pluginName: string) => {
    try {
      if (activePlugins.has(pluginName)) {
        await pluginSystem.deactivatePlugin(pluginName);
        activePlugins.delete(pluginName);
      } else {
        await pluginSystem.activatePlugin(pluginName);
        activePlugins.add(pluginName);
      }
      setActivePlugins(new Set(activePlugins));
      updateSystemStatuses();
    } catch (error) {
      console.error(`Failed to toggle plugin ${pluginName}:`, error);
    }
  };

  const updateSystemStatuses = () => {
    // Update status for all systems
    setSystemStatus({
      mapProvider: activeProvider ? 'active' : 'inactive',
      serviceAdapters: Object.keys(activeAdapters).length > 0 ? 'active' : 'inactive',
      plugins: activePlugins.size > 0 ? 'active' : 'inactive'
    });
  };

  return (
    <div className="system-manager">
      <Section>
        <h2>Map Provider</h2>
        <div className="provider-controls">
          <Button
            onClick={() => handleProviderSwitch('mapbox')}
            active={activeProvider === 'mapbox'}
          >
            Mapbox
          </Button>
          <Button
            onClick={() => handleProviderSwitch('google')}
            active={activeProvider === 'google'}
          >
            Google Maps
          </Button>
          <StatusIndicator status={systemStatus.mapProvider} />
        </div>
      </Section>

      <Section>
        <h2>Service Adapters</h2>
        <div className="adapter-controls">
          {/* Add adapter controls */}
        </div>
      </Section>

      <Section>
        <h2>Plugins</h2>
        <div className="plugin-controls">
          {/* Add plugin controls */}
        </div>
      </Section>
    </div>
  );
}; 