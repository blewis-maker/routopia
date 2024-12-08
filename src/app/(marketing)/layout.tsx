import { ReactNode } from 'react';
import AppShell from '@/components/layout/AppShell';

export const metadata = {
  title: 'Routopia - AI-Powered Route Planning',
  description: 'Discover your perfect route with AI-powered planning that adapts to your preferences.',
};

interface MarketingLayoutProps {
  children: ReactNode;
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <AppShell variant="marketing">
      {children}
    </AppShell>
  );
} 