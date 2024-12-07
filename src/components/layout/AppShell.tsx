'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { NavigationBar } from './NavigationBar';
import CommandPalette from './CommandPalette';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`min-h-screen bg-white dark:bg-stone-950 transition-opacity duration-300 ${
      mounted ? 'opacity-100' : 'opacity-0'
    }`}>
      <NavigationBar 
        className={`transition-opacity duration-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}
        isLandingPage={isLandingPage}
      />
      
      <main className={`relative ${isLandingPage ? '' : 'pt-16'}`}>
        {children}
      </main>

      {mounted && <CommandPalette />}

      {/* Feedback and notification overlays */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2" />
    </div>
  );
} 