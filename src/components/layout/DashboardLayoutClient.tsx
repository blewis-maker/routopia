'use client';

import { ReactNode } from 'react';
import { NavigationBar } from '@/components/navigation/NavigationBar';
import { Sidebar } from './Sidebar';

interface DashboardLayoutClientProps {
  children: ReactNode;
}

export function DashboardLayoutClient({ children }: DashboardLayoutClientProps) {
  return (
    <div className="dashboard-layout">
      <NavigationBar />
      <div className="dashboard-layout__container">
        <Sidebar />
        <main className="dashboard-layout__main">
          {children}
        </main>
      </div>
    </div>
  );
} 