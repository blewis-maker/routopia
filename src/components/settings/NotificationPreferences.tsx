import React, { useEffect, useState } from 'react';
import { Switch } from '@headlessui/react';
import { NotificationPreferences as Preferences } from '@/types/notification';
import { RouteNotificationService } from '@/services/notification/RouteNotificationService';

export default function NotificationPreferences() {
  const [preferences, setPreferences] = useState<Preferences>({
    routeUpdates: true,
    weatherAlerts: true,
    trafficAlerts: true,
    socialUpdates: false
  });

  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');
  const notificationService = new RouteNotificationService();

  useEffect(() => {
    // Get initial notification permission state
    setPermissionState(Notification.permission);
    
    // Load saved preferences
    const savedPrefs = notificationService.getPreferences();
    if (savedPrefs) {
      setPreferences(savedPrefs);
    }
  }, []);

  const handlePermissionRequest = async () => {
    try {
      const permission = await Notification.requestPermission();
      setPermissionState(permission);
    } catch (error) {
      console.error('Failed to request notification permission:', error);
    }
  };

  const handlePreferenceChange = async (key: keyof Preferences, value: boolean) => {
    const updatedPreferences = {
      ...preferences,
      [key]: value
    };
    
    setPreferences(updatedPreferences);
    await notificationService.updatePreferences(updatedPreferences);
  };

  if (permissionState === 'denied') {
    return (
      <div className="p-4 bg-red-50 rounded-lg">
        <p className="text-red-700">
          Notifications are blocked. Please enable notifications in your browser settings to receive route updates.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {permissionState === 'default' && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-blue-700 mb-2">
            Enable notifications to receive important route updates.
          </p>
          <button
            onClick={handlePermissionRequest}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Enable Notifications
          </button>
        </div>
      )}

      {permissionState === 'granted' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            Notification Preferences
          </h3>
          
          <div className="space-y-4">
            <SwitchItem
              enabled={preferences.routeUpdates}
              onChange={(value) => handlePreferenceChange('routeUpdates', value)}
              title="Route Updates"
              description="Get notified about changes to your saved routes"
            />

            <SwitchItem
              enabled={preferences.weatherAlerts}
              onChange={(value) => handlePreferenceChange('weatherAlerts', value)}
              title="Weather Alerts"
              description="Receive alerts about weather conditions affecting your routes"
            />

            <SwitchItem
              enabled={preferences.trafficAlerts}
              onChange={(value) => handlePreferenceChange('trafficAlerts', value)}
              title="Traffic Alerts"
              description="Get updates about traffic conditions on your routes"
            />

            <SwitchItem
              enabled={preferences.socialUpdates}
              onChange={(value) => handlePreferenceChange('socialUpdates', value)}
              title="Social Updates"
              description="Receive notifications about shared routes and activities"
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface SwitchItemProps {
  enabled: boolean;
  onChange: (value: boolean) => void;
  title: string;
  description: string;
}

function SwitchItem({ enabled, onChange, title, description }: SwitchItemProps) {
  return (
    <Switch.Group>
      <div className="flex items-center justify-between">
        <div className="flex-grow">
          <Switch.Label className="text-sm font-medium text-gray-900">
            {title}
          </Switch.Label>
          <Switch.Description className="text-sm text-gray-500">
            {description}
          </Switch.Description>
        </div>
        <Switch
          checked={enabled}
          onChange={onChange}
          className={`${
            enabled ? 'bg-indigo-600' : 'bg-gray-200'
          } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
        >
          <span
            className={`${
              enabled ? 'translate-x-6' : 'translate-x-1'
            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
          />
        </Switch>
      </div>
    </Switch.Group>
  );
} 