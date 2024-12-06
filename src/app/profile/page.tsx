import { useEffect, useState } from 'react';
import { UserPreferences } from '@/components/profile/UserPreferences';
import { RouteHistory } from '@/components/profile/RouteHistory';
import { ActivityHistory } from '@/components/profile/ActivityHistory';
import { DeviceManagement } from '@/components/profile/DeviceManagement';
import { AccountSettings } from '@/components/profile/AccountSettings';
import { useAuth } from '@/hooks/useAuth';
import type { User } from '@/types';

export default function ProfilePage() {
  const { session, status } = useAuth();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (session?.user) {
      fetch('/api/user/profile')
        .then(res => res.json())
        .then(data => setUser(data));
    }
  }, [session]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!session) {
    return null; // Protected by middleware, will redirect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Profile</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-8">
          <UserPreferences user={user} />
          <RouteHistory />
          <ActivityHistory />
        </div>

        {/* Sidebar - Right Column */}
        <div className="space-y-8">
          <DeviceManagement />
          <AccountSettings user={user} />
        </div>
      </div>
    </div>
  );
} 