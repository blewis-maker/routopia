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
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-stone-900/80 backdrop-blur-md border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-2"
            onMouseEnter={() => setIsLogoHovered(true)}
            onMouseLeave={() => setIsLogoHovered(false)}
          >
            <img 
              src="/routopia-logo.png" 
              alt="Routopia" 
              className={`h-8 w-8 transition-all duration-300 ${
                isLogoHovered ? 'animate-logo-active' : ''
              }`}
              width={32}
              height={32}
            />
            <span className={`text-2xl font-bold bg-gradient-to-r from-teal-400 to-emerald-400 text-transparent bg-clip-text transition-all duration-300 ${
              isLogoHovered ? 'scale-105' : ''
            }`}>
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
                  ? 'bg-gradient-to-r from-teal-400 to-emerald-400 text-transparent bg-clip-text font-bold hover:from-teal-300 hover:to-emerald-300 transition-all duration-300 animate-text-pulse'
                  : 'bg-teal-600 hover:bg-teal-500 px-4 py-2 rounded-lg text-white transition-all duration-300 hover:-translate-y-0.5 shadow-lg hover:shadow-teal-500/25 animate-pulse-teal'
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