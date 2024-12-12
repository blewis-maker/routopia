import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { DashboardLayoutClient } from '@/components/layout/DashboardLayoutClient';
import { ActivityContextProvider } from '@/contexts/ActivityContext';
import { GoogleMapsProvider } from '@/contexts/GoogleMapsContext';
import { ServiceInitializer } from '@/components/ServiceInitializer';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/');
  }

  return (
    <DashboardLayoutClient>
      <GoogleMapsProvider>
        <ActivityContextProvider>
          <ServiceInitializer />
          {children}
        </ActivityContextProvider>
      </GoogleMapsProvider>
    </DashboardLayoutClient>
  );
}