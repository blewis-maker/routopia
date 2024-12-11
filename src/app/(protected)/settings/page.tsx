import { StravaAuthButton } from '@/components/auth/StravaAuthButton';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      
      <div className="p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Connected Services</h2>
        <StravaAuthButton />
      </div>
    </div>
  );
} 