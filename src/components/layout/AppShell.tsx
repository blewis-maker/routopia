'use client';

import { ReactNode } from 'react';
import NavigationBar from './NavigationBar';
import CommandPalette from './CommandPalette';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-brand-offwhite font-inter">
      <NavigationBar />
      <CommandPalette />
      
      <main className="relative">
        {children}
      </main>

      {/* Toast Container for Notifications */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {/* Toasts will be rendered here */}
      </div>
    </div>
  );
} 