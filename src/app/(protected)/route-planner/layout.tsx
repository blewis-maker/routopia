import { ReactNode } from 'react';
import AppShell from '@/components/layout/AppShell';

export default function RoutePlannerLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AppShell>
      <div className="route-planner-layout">
        {children}
      </div>
    </AppShell>
  );
} 