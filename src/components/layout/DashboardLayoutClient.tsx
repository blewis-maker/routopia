'use client';

import { ReactNode } from 'react';
import { NavigationBar } from './NavigationBar';
import { Sidebar } from './Sidebar';

interface DashboardLayoutClientProps {
  children: ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function DashboardLayoutClient({ children, user }: DashboardLayoutClientProps) {
  return (
    <div className="dashboard-layout">
      <NavigationBar user={user} />
      <div className="dashboard-layout__container">
        <Sidebar />
        <main className="dashboard-layout__main">
          {children}
        </main>
      </div>
    </div>
  );
} 