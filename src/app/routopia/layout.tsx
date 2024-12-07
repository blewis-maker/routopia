import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import CommandPalette from '@/components/CommandPalette';
import { useCommandPalette } from '@/hooks/useCommandPalette';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session?.user) {
    redirect('/');
  }

  return (
    <AppLayoutClient>
      {children}
    </AppLayoutClient>
  );
}

// Client component for hooks
function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const { isOpen, close } = useCommandPalette();

  return (
    <>
      {children}
      <CommandPalette isOpen={isOpen} onClose={close} />
    </>
  );
} 