import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import CommandPalette from '@/components/CommandPalette';
import { useCommandPalette } from '@/hooks/useCommandPalette';

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

// Client component for hooks
function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const { isOpen, close } = useCommandPalette();

  return (
    <div className="min-h-screen bg-stone-900">
      {/* Top Navigation Bar */}
      <nav className="h-16 border-b border-stone-800 bg-stone-900/50 backdrop-blur-xl fixed top-0 left-0 right-0 z-10">
        <div className="h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/routopia-logo.png" alt="Routopia" className="w-8 h-8" />
            <span className="font-semibold text-white">Routopia</span>
          </div>
          
          {/* Command Palette Trigger */}
          <button 
            onClick={() => close()}
            className="px-3 py-1.5 text-sm text-stone-400 bg-stone-800 rounded-md border border-stone-700"
          >
            Press ⌘K
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-16">
        {children}
      </main>

      {/* Command Palette */}
      <CommandPalette isOpen={isOpen} onClose={close} />
    </div>
  );
} 