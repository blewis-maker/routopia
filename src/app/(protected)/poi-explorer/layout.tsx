import { ReactNode } from 'react';
import AppShell from '@/components/layout/AppShell';

export default function POIExplorerLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="poi-explorer-layout">
      {children}
    </div>
  );
} 