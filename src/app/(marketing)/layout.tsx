import AppShell from '@/components/layout/AppShell';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
} 