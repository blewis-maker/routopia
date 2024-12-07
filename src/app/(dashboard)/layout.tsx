import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import DashboardLayoutClient from '@/components/layout/DashboardLayoutClient';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session?.user) {
    redirect('/');
  }

  return (
    <DashboardLayoutClient>
      {children}
    </DashboardLayoutClient>
  );
} 