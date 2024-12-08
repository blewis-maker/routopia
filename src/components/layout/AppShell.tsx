'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { NavigationBar } from './NavigationBar';
import CommandPalette from './CommandPalette';
import { useSession } from 'next-auth/react';

interface AppShellProps {
  children: ReactNode;
  variant?: 'default' | 'marketing';
}

export default function AppShell({ 
  children, 
  variant = 'default' 
}: AppShellProps) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const isLandingPage = pathname === '/';
  const { data: session } = useSession();

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const shellClassName = `app-shell ${
    variant === 'marketing' ? 'app-shell--marketing' : ''
  } ${mounted ? 'opacity-100' : 'opacity-0'}`;

  return (
    <div className={shellClassName}>
      <NavigationBar 
        className={mounted ? 'opacity-100' : 'opacity-0'}
        isLandingPage={variant === 'marketing'}
        user={session?.user}
      />
      
      <main className={`app-shell__main ${variant === 'marketing' ? '' : 'pt-16'}`}>
        {children}
      </main>

      {mounted && <CommandPalette />}
    </div>
  );
} 