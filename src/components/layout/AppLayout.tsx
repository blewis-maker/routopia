import React from 'react';
import { useMainApplicationStore } from '@/store/app/mainApplication.store';

interface AppLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}

export function AppLayout({ children, showHeader = true, showFooter = true }: AppLayoutProps) {
  const store = useMainApplicationStore();

  return (
    <div className="app-container">
      {showHeader && (
        <header className="app-header">
          <nav className="app-navigation">
            {/* Add navigation components */}
          </nav>
          <div className="app-controls">
            {/* Add global controls */}
          </div>
        </header>
      )}

      <main className="app-main">
        {children}
      </main>

      {showFooter && (
        <footer className="app-footer">
          {/* Add footer content */}
        </footer>
      )}
    </div>
  );
} 