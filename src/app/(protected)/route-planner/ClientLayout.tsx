'use client';

import { ReactNode, Suspense } from 'react';
import { ProgressProvider } from '@/contexts/ProgressContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import RoutePlannerLoading from './loading';

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <ErrorBoundary>
      <ProgressProvider>
        <Suspense fallback={<RoutePlannerLoading />}>
          <div className="fixed inset-0 top-16 overflow-hidden">
            {children}
          </div>
        </Suspense>
      </ProgressProvider>
    </ErrorBoundary>
  );
} 