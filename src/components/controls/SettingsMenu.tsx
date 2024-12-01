import React, { useState } from 'react';
import { MapSettings, DisplaySettings, NotificationSettings } from '@/types/settings';

interface Props {
  settings: {
    map: MapSettings;
    display: DisplaySettings;
    notifications: NotificationSettings;
  };
  onSettingsChange: (newSettings: any) => void;
}

export const SettingsMenu: React.FC<Props> = ({ settings, onSettingsChange }) => {
  const [activeTab, setActiveTab] = useState<'map' | 'display' | 'notifications'>('map');

  const handleSettingChange = (category: string, setting: string, value: any) => {
    onSettingsChange({
      ...settings,
      [category]: {
        ...settings[category as keyof typeof settings],
        [setting]: value
      }
    });
  };

  return (
    <div className="settings-menu bg-stone-800 rounded-lg p-4 w-80">
      <div className="flex border-b border-stone-700 mb-4">
        {['map', 'display', 'notifications'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`
              px-4 py-2 text-sm font-medium
              ${activeTab === tab 
                ? 'text-emerald-500 border-b-2 border-emerald-500' 
                : 'text-stone-400 hover:text-stone-300'}
            `}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'map' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-stone-300">Show Traffic</label>
            <input
              type="checkbox"
              checked={settings.map.showTraffic}
              onChange={(e) => handleSettingChange('map', 'showTraffic', e.target.checked)}
              className="toggle"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-stone-300">3D Buildings</label>
            <input
              type="checkbox"
              checked={settings.map.show3DBuildings}
              onChange={(e) => handleSettingChange('map', 'show3DBuildings', e.target.checked)}
              className="toggle"
            />
          </div>
          <div className="space-y-2">
            <label className="text-stone-300 block">Map Style</label>
            <select
              value={settings.map.style}
              onChange={(e) => handleSettingChange('map', 'style', e.target.value)}
              className="w-full bg-stone-700 text-white rounded px-3 py-2"
            >
              <option value="streets">Streets</option>
              <option value="satellite">Satellite</option>
              <option value="terrain">Terrain</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>
      )}

      {activeTab === 'display' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-stone-300 block">Units</label>
            <select
              value={settings.display.units}
              onChange={(e) => handleSettingChange('display', 'units', e.target.value)}
              className="w-full bg-stone-700 text-white rounded px-3 py-2"
            >
              <option value="metric">Metric</option>
              <option value="imperial">Imperial</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-stone-300">High Contrast</label>
            <input
              type="checkbox"
              checked={settings.display.highContrast}
              onChange={(e) => handleSettingChange('display', 'highContrast', e.target.checked)}
              className="toggle"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-stone-300">Animations</label>
            <input
              type="checkbox"
              checked={settings.display.enableAnimations}
              onChange={(e) => handleSettingChange('display', 'enableAnimations', e.target.checked)}
              className="toggle"
            />
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-stone-300">Route Updates</label>
            <input
              type="checkbox"
              checked={settings.notifications.routeUpdates}
              onChange={(e) => handleSettingChange('notifications', 'routeUpdates', e.target.checked)}
              className="toggle"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-stone-300">Traffic Alerts</label>
            <input
              type="checkbox"
              checked={settings.notifications.trafficAlerts}
              onChange={(e) => handleSettingChange('notifications', 'trafficAlerts', e.target.checked)}
              className="toggle"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-stone-300">Weather Alerts</label>
            <input
              type="checkbox"
              checked={settings.notifications.weatherAlerts}
              onChange={(e) => handleSettingChange('notifications', 'weatherAlerts', e.target.checked)}
              className="toggle"
            />
          </div>
        </div>
      )}
    </div>
  );
}; 