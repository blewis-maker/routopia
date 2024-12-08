'use client';

import { ReactNode } from 'react';
import { NavigationBar } from '@/components/navigation/NavigationBar';
import { CommandPalette } from '@/components/navigation/CommandPalette';
import { useSession } from 'next-auth/react';

type AppShellVariant = 'default' | 'marketing';

interface AppShellProps {
  children: ReactNode;
  variant?: AppShellVariant;
}

const AppShell = ({ children, variant = 'default' }: AppShellProps) => {
  const { data: session } = useSession();
  const isLandingPage = variant === 'marketing';

  return (
    <div className={`app-shell ${isLandingPage ? 'app-shell--marketing' : ''}`}>
      <NavigationBar 
        user={session?.user}
        isLandingPage={isLandingPage}
      />
      <main className={`app-shell__main ${!isLandingPage ? 'pt-16' : ''}`}>
        {children}
      </main>
      {session && <CommandPalette />}
    </div>
  );
};

AppShell.displayName = 'AppShell';

export default AppShell; 