import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import AppShell from '@/components/layout/AppShell';
import { ProgressProvider } from '@/contexts/ProgressContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { authOptions } from '@/lib/auth';
import { GoogleMapsProvider } from '@/contexts/GoogleMapsContext';
interface RoutePlannerLayoutProps {
  children: ReactNode;
}

export default async function RoutePlannerLayout({ children }: RoutePlannerLayoutProps) {
  const session = await getServerSession(authOptions);

  // Redirect unauthenticated users to marketing page
  if (!session) {
    redirect('/');
  }

  return (
    <AppShell>
      <ErrorBoundary>
        <GoogleMapsProvider>
          <ProgressProvider>
            <div className="fixed inset-0 top-16 overflow-hidden">
              {children}
            </div>
          </ProgressProvider>
        </GoogleMapsProvider>
      </ErrorBoundary>
    </AppShell>
  );
}