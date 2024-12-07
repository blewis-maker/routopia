import { ReactNode } from 'react';
import AppShell from '@/components/layout/AppShell';

export default function ActivityHubLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="activity-hub-layout">
      {children}
    </div>
  );
} 