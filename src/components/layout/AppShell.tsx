'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import NavigationBar from './NavigationBar';
import CommandPalette from './CommandPalette';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const isLandingPage = pathname === '/';

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering navigation until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-brand-offwhite font-inter">
        <main className="relative">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-offwhite font-inter">
      {!isLandingPage && <NavigationBar />}
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