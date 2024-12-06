import { useState } from 'react';
import type { User } from '@/types';

interface Props {
  user: User | null;
}

export function AccountSettings({ user }: Props) {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [privacySettings, setPrivacySettings] = useState({
    showProfile: true,
    showActivities: true,
    showRoutes: true
  });

  const handleNotificationChange = async (type: 'email' | 'push', enabled: boolean) => {
    try {
      await fetch('/api/user/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, enabled })
      });

      if (type === 'email') setEmailNotifications(enabled);
      else setPushNotifications(enabled);
    } catch (error) {
      console.error('Failed to update notification settings:', error);
    }
  };

  const handlePrivacyChange = async (setting: keyof typeof privacySettings, enabled: boolean) => {
    try {
      await fetch('/api/user/privacy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setting, enabled })
      });

      setPrivacySettings(prev => ({
        ...prev,
        [setting]: enabled
      }));
    } catch (error) {
      console.error('Failed to update privacy settings:', error);
    }
  };

  const handlePasswordChange = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const currentPassword = (form.elements.namedItem('currentPassword') as HTMLInputElement).value;
    const newPassword = (form.elements.namedItem('newPassword') as HTMLInputElement).value;

    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      if (response.ok) {
        form.reset();
        // Show success message
      }
    } catch (error) {
      console.error('Failed to update password:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-stone-800 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-white mb-6">Account Settings</h2>

      {/* Account Info */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-white mb-4">Account Information</h3>
        <div className="space-y-2 text-stone-300">
          <p>Email: {user.email}</p>
          <p>Member since: {new Date(user.createdAt).toLocaleDateString()}</p>
          <p>Account type: {user.accountType}</p>
        </div>
      </div>

      {/* Notifications */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-white mb-4">Notifications</h3>
        <div className="space-y-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => handleNotificationChange('email', e.target.checked)}
              className="sr-only"
            />
            <div className={`w-11 h-6 rounded-full transition-colors ${
              emailNotifications ? 'bg-emerald-600' : 'bg-stone-600'
            }`}>
              <div className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                emailNotifications ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </div>
            <span className="ml-2 text-stone-300">Email Notifications</span>
          </label>

          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={pushNotifications}
              onChange={(e) => handleNotificationChange('push', e.target.checked)}
              className="sr-only"
            />
            <div className={`w-11 h-6 rounded-full transition-colors ${
              pushNotifications ? 'bg-emerald-600' : 'bg-stone-600'
            }`}>
              <div className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                pushNotifications ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </div>
            <span className="ml-2 text-stone-300">Push Notifications</span>
          </label>
        </div>
      </div>

      {/* Privacy */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-white mb-4">Privacy</h3>
        <div className="space-y-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={privacySettings.showProfile}
              onChange={(e) => handlePrivacyChange('showProfile', e.target.checked)}
              className="sr-only"
            />
            <div className={`w-11 h-6 rounded-full transition-colors ${
              privacySettings.showProfile ? 'bg-emerald-600' : 'bg-stone-600'
            }`}>
              <div className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                privacySettings.showProfile ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </div>
            <span className="ml-2 text-stone-300">Public Profile</span>
          </label>

          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={privacySettings.showActivities}
              onChange={(e) => handlePrivacyChange('showActivities', e.target.checked)}
              className="sr-only"
            />
            <div className={`w-11 h-6 rounded-full transition-colors ${
              privacySettings.showActivities ? 'bg-emerald-600' : 'bg-stone-600'
            }`}>
              <div className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                privacySettings.showActivities ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </div>
            <span className="ml-2 text-stone-300">Public Activities</span>
          </label>

          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={privacySettings.showRoutes}
              onChange={(e) => handlePrivacyChange('showRoutes', e.target.checked)}
              className="sr-only"
            />
            <div className={`w-11 h-6 rounded-full transition-colors ${
              privacySettings.showRoutes ? 'bg-emerald-600' : 'bg-stone-600'
            }`}>
              <div className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                privacySettings.showRoutes ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </div>
            <span className="ml-2 text-stone-300">Public Routes</span>
          </label>
        </div>
      </div>

      {/* Password Change */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Change Password</h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-stone-300 mb-1">Current Password</label>
            <input
              type="password"
              name="currentPassword"
              required
              className="w-full bg-stone-700 text-white rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-stone-300 mb-1">New Password</label>
            <input
              type="password"
              name="newPassword"
              required
              className="w-full bg-stone-700 text-white rounded px-3 py-2"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 text-white rounded py-2 hover:bg-emerald-500 transition-colors"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
} 