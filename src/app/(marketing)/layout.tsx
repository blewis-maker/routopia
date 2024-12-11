import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import AppShell from '@/components/layout/AppShell';
import { authOptions } from '@/lib/auth';

export const metadata = {
  title: 'Routopia - AI-Powered Route Planning',
  description: 'Discover your perfect route with AI-powered planning that adapts to your preferences.',
};

interface MarketingLayoutProps {
  children: ReactNode;
}

export default async function MarketingLayout({ children }: MarketingLayoutProps) {
  const session = await getServerSession(authOptions);

  // Redirect authenticated users to route planner
  if (session) {
    redirect('/route-planner');
  }

  return (
    <AppShell variant="marketing">
      {children}
    </AppShell>
  );
} 