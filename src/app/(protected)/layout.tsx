import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import DashboardLayoutClient from '@/components/layout/DashboardLayoutClient';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/?signin=true');
  }

  return (
    <DashboardLayoutClient user={session.user}>
      {children}
    </DashboardLayoutClient>
  );
}