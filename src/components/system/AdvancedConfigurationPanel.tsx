import React, { useState, useEffect } from 'react';
import { Section, Button, Input, Select, Tabs } from '@/components/common/styles';

interface AdvancedConfig {
  analytics: {
    enabled: boolean;
    trackingLevel: 'basic' | 'detailed' | 'full';
    batchSize: number;
    flushInterval: number;
  };
  performance: {
    cacheStrategy: 'memory' | 'persistent' | 'hybrid';
    maxCacheSize: number;
    preloadRadius: number;
    concurrentRequests: number;
  };
  plugins: {
    autoUpdate: boolean;
    loadOrder: string[];
    fallbackBehavior: 'disable' | 'degrade' | 'substitute';
  };
}

export const AdvancedConfigurationPanel: React.FC<{
  onSave: (config: AdvancedConfig) => Promise<void>;
  initialConfig: AdvancedConfig;
}> = ({ onSave, initialConfig }) => {
  const [config, setConfig] = useState<AdvancedConfig>(initialConfig);
  const [activeTab, setActiveTab] = useState('analytics');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(config);
    } catch (error) {
      console.error('Failed to save configuration:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Section className="advanced-configuration">
      <h2>Advanced Configuration</h2>

      <Tabs
        value={activeTab}
        onChange={(tab) => setActiveTab(tab)}
        tabs={[
          { id: 'analytics', label: 'Analytics' },
          { id: 'performance', label: 'Performance' },
          { id: 'plugins', label: 'Plugins' }
        ]}
      />

      {activeTab === 'analytics' && (
        <div className="analytics-config">
          <h3>Analytics Configuration</h3>
          <Input
            type="checkbox"
            label="Enable Analytics"
            checked={config.analytics.enabled}
            onChange={(e) => setConfig({
              ...config,
              analytics: {
                ...config.analytics,
                enabled: e.target.checked
              }
            })}
          />
          <Select
            label="Tracking Level"
            value={config.analytics.trackingLevel}
            onChange={(e) => setConfig({
              ...config,
              analytics: {
                ...config.analytics,
                trackingLevel: e.target.value as any
              }
            })}
          >
            <option value="basic">Basic</option>
            <option value="detailed">Detailed</option>
            <option value="full">Full</option>
          </Select>
          {/* More analytics options */}
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="performance-config">
          <h3>Performance Configuration</h3>
          <Select
            label="Cache Strategy"
            value={config.performance.cacheStrategy}
            onChange={(e) => setConfig({
              ...config,
              performance: {
                ...config.performance,
                cacheStrategy: e.target.value as any
              }
            })}
          >
            <option value="memory">Memory Only</option>
            <option value="persistent">Persistent</option>
            <option value="hybrid">Hybrid</option>
          </Select>
          {/* More performance options */}
        </div>
      )}

      {activeTab === 'plugins' && (
        <div className="plugins-config">
          <h3>Plugin Configuration</h3>
          <Input
            type="checkbox"
            label="Auto Update Plugins"
            checked={config.plugins.autoUpdate}
            onChange={(e) => setConfig({
              ...config,
              plugins: {
                ...config.plugins,
                autoUpdate: e.target.checked
              }
            })}
          />
          {/* More plugin options */}
        </div>
      )}

      <Button
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Save Advanced Configuration'}
      </Button>
    </Section>
  );
}; 