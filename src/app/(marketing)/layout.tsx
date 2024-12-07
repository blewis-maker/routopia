import VideoBackground from '@/components/landing/VideoBackground';
import Link from 'next/link';
import Image from 'next/image';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-stone-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/routopia-logo.png"
              alt="Routopia"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="font-semibold text-white">Routopia</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/features" className="text-stone-300 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="/route-planner" className="text-stone-300 hover:text-white transition-colors">
              Route Planner
            </Link>
            <Link href="/poi-explorer" className="text-stone-300 hover:text-white transition-colors">
              POI Explorer
            </Link>
            <Link href="/activity-hub" className="text-stone-300 hover:text-white transition-colors">
              Activity Hub
            </Link>
            <Link 
              href="/login"
              className="px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      {children}
    </div>
  );
} 