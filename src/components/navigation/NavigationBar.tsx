'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User, Menu, X } from 'lucide-react';
import SignUpModal from '@/components/SignUpModal';
import { signIn, signOut } from 'next-auth/react';

interface NavigationBarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  className?: string;
  isLandingPage?: boolean;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  user,
  className = '',
  isLandingPage = false,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = React.useState(false);

  const handleSignIn = () => signIn('google');
  const handleSignOut = () => signOut();

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 ${
      isLandingPage ? 'bg-transparent' : 'bg-[#1B1B1B]/95 backdrop-blur-sm border-b border-stone-800/50'
    } ${className}`}>
      <div className="max-w-full mx-4 px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <svg 
              className="w-6 h-6 animate-logo-blink text-stone-400 group-hover:text-stone-300" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <circle cx="12" cy="4.5" r="2.5"/>
              <path d="m10.2 6.3-3.9 3.9"/>
              <circle cx="4.5" cy="12" r="2.5"/>
              <path d="M7 12h10"/>
              <circle cx="19.5" cy="12" r="2.5"/>
              <path d="m13.8 17.7 3.9-3.9"/>
              <circle cx="12" cy="19.5" r="2.5"/>
            </svg>
            <span className="text-stone-400 group-hover:text-stone-300 transition-colors duration-200">
              Routopia
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {!isLandingPage && (
              <Link
                href="/route-planner"
                className="text-sm text-stone-400 hover:text-stone-300 transition-colors duration-200"
              >
                Route Planner
              </Link>
            )}
            {user ? (
              <div className="flex items-center gap-4">
                {user.image ? (
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-stone-700/50">
                    <Image
                      src={user.image}
                      alt={user.name || 'User'}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-stone-800 border border-stone-700/50 flex items-center justify-center">
                    <span className="text-sm font-medium text-stone-300">
                      {user.name?.[0] || '?'}
                    </span>
                  </div>
                )}
                <button
                  onClick={handleSignOut}
                  className="text-sm text-stone-400 hover:text-stone-300 transition-colors duration-200"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                className="flex items-center gap-2 text-sm text-stone-400 hover:text-stone-300 transition-colors duration-200"
              >
                <User className="w-4 h-4" />
                Sign In
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-stone-400 hover:text-stone-300 transition-colors duration-200"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`
        md:hidden
        transition-all duration-300 ease-in-out
        ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
        overflow-hidden
        bg-[#1B1B1B]/95 backdrop-blur-sm border-t border-stone-800/50
      `}>
        <div className="px-4 pt-2 pb-3 space-y-1">
          {!isLandingPage && (
            <Link
              href="/route-planner"
              className="block px-3 py-2 rounded-md text-base font-medium text-stone-400 hover:text-stone-300"
            >
              Route Planner
            </Link>
          )}
          {user ? (
            <div className="px-3 py-2 flex items-center gap-3">
              <span className="text-sm text-stone-400">{user.name}</span>
              <button
                onClick={handleSignOut}
                className="text-sm text-stone-400 hover:text-stone-300"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              className="block w-full px-3 py-2 rounded-md text-base font-medium text-stone-400 hover:text-stone-300"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};