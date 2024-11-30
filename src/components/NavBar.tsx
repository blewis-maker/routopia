'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export default function NavBar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-16 bg-stone-900/90 backdrop-blur-md border-b border-stone-800" />;
  }

  const navItems = [
    { name: 'Discover', href: '/dashboard' },
    { name: 'Routes', href: '/routes' },
    { name: 'About', href: '/about' }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-stone-900/90 backdrop-blur-md border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-3">
            <img src="/logo.svg" alt="Routopia" className="h-8 w-8 hover:opacity-80 transition-opacity" />
            <span className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
              Routopia
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-stone-800 text-white'
                    : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            ))}
            {session ? (
              <Link
                href="/profile"
                className="ml-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-md text-sm font-medium transition-colors"
              >
                Profile
              </Link>
            ) : (
              <Link
                href="/?signin=true"
                className="ml-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-md text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 