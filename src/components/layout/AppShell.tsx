'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { NavigationBar } from './NavigationBar';
import CommandPalette from './CommandPalette';
import { useSession } from 'next-auth/react';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const isLandingPage = pathname === '/';
  const { data: session } = useSession();

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`app-shell ${isLandingPage ? 'app-shell--marketing' : ''} ${
      mounted ? 'opacity-100' : 'opacity-0'
    }`}>
      <NavigationBar 
        className={mounted ? 'opacity-100' : 'opacity-0'}
        isLandingPage={isLandingPage}
        user={session?.user}
      />
      
      <main className={`app-shell__main ${isLandingPage ? '' : 'pt-16'}`}>
        {children}
      </main>

      {mounted && <CommandPalette />}
    </div>
  );
} 