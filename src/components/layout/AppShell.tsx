'use client';

import { ReactNode, useEffect, useState } from 'react';
import NavigationBar from './NavigationBar';
import CommandPalette from './CommandPalette';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`min-h-screen bg-background-primary transition-opacity duration-300 ${
      mounted ? 'opacity-100' : 'opacity-0'
    }`}>
      <NavigationBar className={mounted ? 'opacity-100' : 'opacity-0'} />
      {mounted && <CommandPalette />}
      
      <main className="relative">
        {children}
      </main>

      <div className="fixed bottom-4 right-4 z-50 space-y-2" />
    </div>
  );
} 