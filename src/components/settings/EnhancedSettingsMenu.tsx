import React, { useState, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import type { Settings, Theme, Accessibility } from '@/types/settings';

interface Props extends BaseSettingsProps {
  onExport?: () => Promise<string>;
  onImport?: (data: string) => Promise<void>;
  onReset?: () => Promise<void>;
  onBackup?: () => Promise<void>;
}

export const EnhancedSettingsMenu: React.FC<Props> = ({
  settings,
  onSettingsChange,
  onExport,
  onImport,
  onReset,
  onBackup,
  ...props
}) => {
  const [activeSection, setActiveSection] = useState('general');
  const [isBackupEnabled, setIsBackupEnabled] = useState(false);
  const [lastBackup, setLastBackup] = useState<Date | null>(null);

  // Accessibility settings
  const handleAccessibilityChange = (changes: Partial<Accessibility>) => {
    onSettingsChange({
      accessibility: { ...settings.accessibility, ...changes }
    });
  };

  // Data management
  const handleDataExport = async () => {
    try {
      const data = await onExport?.();
      if (data) {
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `settings-backup-${new Date().toISOString()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleDataImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const text = await file.text();
        await onImport?.(text);
      } catch (error) {
        console.error('Import failed:', error);
      }
    }
  };

  return (
    <animated.div className="enhanced-settings">
      <SettingsTabs
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <div className="settings-content">
        {activeSection === 'accessibility' && (
          <AccessibilitySettings
            settings={settings.accessibility}
            onChange={handleAccessibilityChange}
          />
        )}

        {activeSection === 'backup' && (
          <BackupSettings
            isEnabled={isBackupEnabled}
            lastBackup={lastBackup}
            onBackupToggle={setIsBackupEnabled}
            onExport={handleDataExport}
            onImport={handleDataImport}
            onReset={onReset}
          />
        )}

        {activeSection === 'advanced' && (
          <AdvancedSettings
            settings={settings}
            onChange={onSettingsChange}
          />
        )}
      </div>

      <SettingsFooter
        onSave={props.onSave}
        onCancel={props.onCancel}
        hasChanges={props.hasChanges}
      />
    </animated.div>
  );
};

// Helper Components
const AccessibilitySettings: React.FC<AccessibilityProps> = ({ settings, onChange }) => (
  <div className="settings-section">
    <h3>Accessibility</h3>
    <div className="setting-group">
      <label>
        <input
          type="checkbox"
          checked={settings.reduceMotion}
          onChange={e => onChange({ reduceMotion: e.target.checked })}
        />
        Reduce motion
      </label>
      <label>
        <input
          type="checkbox"
          checked={settings.highContrast}
          onChange={e => onChange({ highContrast: e.target.checked })}
        />
        High contrast
      </label>
      <label>
        <input
          type="range"
          min="100"
          max="200"
          value={settings.textSize}
          onChange={e => onChange({ textSize: Number(e.target.value) })}
        />
        Text size: {settings.textSize}%
      </label>
    </div>
  </div>
); 