'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { UserAvatar } from './UserAvatar';
import Image from 'next/image';

// Dynamically import SignUpModal to avoid SSR issues
const SignUpModal = dynamic(() => import('./SignUpModal'), {
  ssr: false,
});

export default function NavBar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const { status } = useSession();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-stone-900/80 backdrop-blur-md border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link 
            href="/"
            className="flex items-center"
            onMouseEnter={() => setIsLogoHovered(true)}
            onMouseLeave={() => setIsLogoHovered(false)}
          >
            <Image
              src="/logo.png"
              alt="Routopia"
              className={`h-8 w-8 mr-2 ${isLogoHovered ? 'animate-logo-active' : ''}`}
              width={32}
              height={32}
              priority
            />
            <span className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
              Routopia
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            {status === "authenticated" ? (
              <>
                <Link href="/discover" className="text-stone-300 hover:text-white">
                  Discover
                </Link>
                <Link href="/routes" className="text-stone-300 hover:text-white">
                  Routes
                </Link>
                <UserAvatar />
              </>
            ) : (
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-lg font-semibold
                  text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400
                  transform transition-all duration-300
                  animate-logo-hover"
              >
                Log In
              </button>
            )}
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