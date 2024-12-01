import React, { useState, useEffect } from 'react';
import { PluginSystem } from '@/services/plugins/PluginSystem';
import { Section, Button, StatusIndicator } from '@/components/common/styles';

interface Props {
  pluginSystem: PluginSystem;
}

interface PluginState {
  name: string;
  version: string;
  status: 'active' | 'inactive' | 'error';
  dependencies: string[];
  error?: string;
}

export const PluginManager: React.FC<Props> = ({ pluginSystem }) => {
  const [plugins, setPlugins] = useState<PluginState[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPluginStates();
  }, []);

  const loadPluginStates = async () => {
    try {
      // Get all registered plugins and their states
      const pluginStates = await Promise.all(
        Array.from(pluginSystem.getPlugins()).map(async ([name, plugin]) => {
          try {
            const isActive = await pluginSystem.isPluginActive(name);
            return {
              name,
              version: plugin.version,
              status: isActive ? 'active' : 'inactive',
              dependencies: plugin.dependencies || []
            };
          } catch (error) {
            return {
              name,
              version: plugin.version,
              status: 'error',
              dependencies: plugin.dependencies || [],
              error: error.message
            };
          }
        })
      );

      setPlugins(pluginStates);
    } catch (error) {
      console.error('Failed to load plugin states:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePluginToggle = async (pluginName: string) => {
    try {
      const plugin = plugins.find(p => p.name === pluginName);
      if (!plugin) return;

      if (plugin.status === 'active') {
        await pluginSystem.deactivatePlugin(pluginName);
      } else {
        await pluginSystem.activatePlugin(pluginName);
      }

      await loadPluginStates();
    } catch (error) {
      console.error(`Failed to toggle plugin ${pluginName}:`, error);
    }
  };

  if (loading) {
    return <div>Loading plugins...</div>;
  }

  return (
    <Section className="plugin-manager">
      <h2>Plugin Management</h2>
      
      <div className="plugin-list">
        {plugins.map(plugin => (
          <div key={plugin.name} className="plugin-item">
            <div className="plugin-info">
              <h3>{plugin.name} v{plugin.version}</h3>
              <StatusIndicator status={plugin.status} />
              {plugin.error && (
                <div className="error-message">{plugin.error}</div>
              )}
            </div>
            
            <div className="plugin-dependencies">
              {plugin.dependencies.length > 0 && (
                <small>
                  Depends on: {plugin.dependencies.join(', ')}
                </small>
              )}
            </div>
            
            <Button
              onClick={() => handlePluginToggle(plugin.name)}
              disabled={plugin.status === 'error'}
            >
              {plugin.status === 'active' ? 'Deactivate' : 'Activate'}
            </Button>
          </div>
        ))}
      </div>
    </Section>
  );
}; 