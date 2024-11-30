'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useState } from 'react';

// Dynamically import SignUpModal to avoid SSR issues
const SignUpModal = dynamic(() => import('./SignUpModal'), {
  ssr: false,
});

export default function NavBar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-stone-900/80 backdrop-blur-md border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <img 
              src="/routopia-logo.png" 
              alt="Routopia" 
              className="h-8 w-8 filter brightness-100 saturate-100"
              width={32}
              height={32}
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-emerald-400 text-transparent bg-clip-text">
              Routopia
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            {!isHomePage && (
              <>
                <Link href="/discover" className="text-stone-300 hover:text-white">
                  Discover
                </Link>
                <Link href="/routes" className="text-stone-300 hover:text-white">
                  Routes
                </Link>
                <Link href="/about" className="text-stone-300 hover:text-white">
                  About
                </Link>
              </>
            )}
            <button
              onClick={() => setIsModalOpen(true)}
              className={`${
                isHomePage 
                  ? 'text-stone-200 hover:text-teal-400'
                  : 'bg-teal-600 hover:bg-teal-500 px-4 py-2 rounded-lg text-white'
              }`}
            >
              {isHomePage ? 'Log In' : 'Profile'}
            </button>
          </div>
        </div>
      </div>

      <SignUpModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </nav>
  );
} 