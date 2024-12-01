import React, { useState, useEffect } from 'react';
import { MapProviderSystem } from '@/services/integration/MapProviderSystem';
import { ServiceAdapterFramework } from '@/services/integration/ServiceAdapterFramework';
import { PluginSystem } from '@/services/plugins/PluginSystem';
import { Section, Button, Input, Select } from '@/components/common/styles';

interface Props {
  mapSystem: MapProviderSystem;
  adapterFramework: ServiceAdapterFramework;
  pluginSystem: PluginSystem;
}

interface SystemConfig {
  mapProvider: string;
  adapters: Record<string, string>;
  plugins: string[];
  performance: {
    cacheSize: number;
    updateInterval: number;
    maxConcurrentRequests: number;
  };
}

export const ConfigurationPanel: React.FC<Props> = ({
  mapSystem,
  adapterFramework,
  pluginSystem
}) => {
  const [config, setConfig] = useState<SystemConfig>({
    mapProvider: '',
    adapters: {},
    plugins: [],
    performance: {
      cacheSize: 100,
      updateInterval: 5000,
      maxConcurrentRequests: 5
    }
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCurrentConfig();
  }, []);

  const loadCurrentConfig = async () => {
    try {
      // Load configuration from systems
      const currentConfig = {
        mapProvider: await mapSystem.getCurrentProvider(),
        adapters: await adapterFramework.getActiveAdapters(),
        plugins: await pluginSystem.getActivePlugins(),
        performance: await loadPerformanceConfig()
      };
      setConfig(currentConfig);
    } catch (error) {
      console.error('Failed to load configuration:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        mapSystem.switchProvider(config.mapProvider),
        ...Object.entries(config.adapters).map(([type, adapter]) =>
          adapterFramework.setActiveAdapter(type, adapter)
        ),
        ...config.plugins.map(plugin =>
          pluginSystem.activatePlugin(plugin)
        ),
        savePerformanceConfig(config.performance)
      ]);
    } catch (error) {
      console.error('Failed to save configuration:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Section className="configuration-panel">
      <h2>System Configuration</h2>

      <div className="config-section">
        <h3>Map Provider</h3>
        <Select
          value={config.mapProvider}
          onChange={e => setConfig({
            ...config,
            mapProvider: e.target.value
          })}
        >
          <option value="mapbox">Mapbox</option>
          <option value="google">Google Maps</option>
        </Select>
      </div>

      <div className="config-section">
        <h3>Performance</h3>
        <Input
          type="number"
          label="Cache Size (MB)"
          value={config.performance.cacheSize}
          onChange={e => setConfig({
            ...config,
            performance: {
              ...config.performance,
              cacheSize: parseInt(e.target.value)
            }
          })}
        />
        <Input
          type="number"
          label="Update Interval (ms)"
          value={config.performance.updateInterval}
          onChange={e => setConfig({
            ...config,
            performance: {
              ...config.performance,
              updateInterval: parseInt(e.target.value)
            }
          })}
        />
      </div>

      <Button
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Save Configuration'}
      </Button>
    </Section>
  );
};

async function loadPerformanceConfig() {
  // Implementation of performance config loading
  return {
    cacheSize: 100,
    updateInterval: 5000,
    maxConcurrentRequests: 5
  };
}

async function savePerformanceConfig(config: any) {
  // Implementation of performance config saving
} 