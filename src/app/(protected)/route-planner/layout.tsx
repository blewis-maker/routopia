import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import AppShell from '@/components/layout/AppShell';
import { ProgressProvider } from '@/contexts/ProgressContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { authOptions } from '@/lib/auth';
import { SavedRoutes } from '@/components/route-planner/SavedRoutes';
import ClientLayout from './ClientLayout';

export default async function RoutePlannerLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/');
  }

  return (
    <AppShell>
      <ErrorBoundary>
        <ProgressProvider>
          <div className="fixed inset-0 top-16 overflow-hidden">
            <div className="flex h-full">
              <div className="flex-1 relative">
                <ClientLayout>
                  {children}
                </ClientLayout>
              </div>
              <SavedRoutes userId={session.user.id} />
            </div>
          </div>
        </ProgressProvider>
      </ErrorBoundary>
    </AppShell>
  );
}