import AppShell from '@/components/layout/AppShell';

export const metadata = {
  title: 'Routopia - AI-Powered Route Planning',
  description: 'Discover your perfect route with AI-powered planning that adapts to your preferences, weather conditions, and points of interest.',
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
} 