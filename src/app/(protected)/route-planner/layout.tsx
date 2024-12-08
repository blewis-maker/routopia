import { ReactNode } from 'react';
import AppShell from '@/components/layout/AppShell';

export default function RoutePlannerLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AppShell>
      <div className="fixed inset-0 top-16 overflow-hidden">
        {children}
      </div>
    </AppShell>
  );
} 