import React, { useState } from 'react';
import { useSpring, animated } from '@react-spring/web';
import type { Settings, Theme } from '@/types/settings';

interface Props {
  settings: Settings;
  onSettingsChange: (settings: Partial<Settings>) => void;
  onClose: () => void;
  isOpen: boolean;
}

export const SettingsMenu: React.FC<Props> = ({
  settings,
  onSettingsChange,
  onClose,
  isOpen
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'display' | 'privacy'>('general');

  const animation = useSpring({
    transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
    opacity: isOpen ? 1 : 0,
    config: { tension: 280, friction: 20 }
  });

  const handleThemeChange = (theme: Theme) => {
    onSettingsChange({ theme });
  };

  const handleUnitChange = (unit: 'metric' | 'imperial') => {
    onSettingsChange({ units: unit });
  };

  return (
    <animated.div 
      style={animation}
      className="settings-menu"
      role="dialog"
      aria-label="Settings"
    >
      <div className="settings-header">
        <h2>Settings</h2>
        <button 
          onClick={onClose}
          className="close-button"
          aria-label="Close settings"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="settings-tabs">
        <button
          onClick={() => setActiveTab('general')}
          className={`tab ${activeTab === 'general' ? 'active' : ''}`}
          aria-selected={activeTab === 'general'}
        >
          General
        </button>
        <button
          onClick={() => setActiveTab('display')}
          className={`tab ${activeTab === 'display' ? 'active' : ''}`}
          aria-selected={activeTab === 'display'}
        >
          Display
        </button>
        <button
          onClick={() => setActiveTab('privacy')}
          className={`tab ${activeTab === 'privacy' ? 'active' : ''}`}
          aria-selected={activeTab === 'privacy'}
        >
          Privacy
        </button>
      </div>

      <div className="settings-content">
        {activeTab === 'general' && (
          <div className="settings-section">
            <h3>Units</h3>
            <div className="setting-option">
              <label>
                <input
                  type="radio"
                  name="units"
                  checked={settings.units === 'metric'}
                  onChange={() => handleUnitChange('metric')}
                />
                Metric
              </label>
              <label>
                <input
                  type="radio"
                  name="units"
                  checked={settings.units === 'imperial'}
                  onChange={() => handleUnitChange('imperial')}
                />
                Imperial
              </label>
            </div>

            <h3>Language</h3>
            <select
              value={settings.language}
              onChange={(e) => onSettingsChange({ language: e.target.value })}
              className="setting-select"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
          </div>
        )}

        {/* Additional tab content... */}
      </div>
    </animated.div>
  );
}; 