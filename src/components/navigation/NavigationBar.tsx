'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User, Menu, X } from 'lucide-react';
import SignUpModal from '@/components/SignUpModal';
import { useTheme } from '@/styles/theme';
import { signIn, signOut } from 'next-auth/react';
import Logo from '@/assets/icons/routopia-logo.png';

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
  const theme = useTheme();

  const handleSignIn = () => {
    signIn('google');
  };

  const handleSignOut = () => {
    signOut();
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        isLandingPage ? 'bg-transparent' : 'bg-[#1B1B1B]/95 backdrop-blur-sm border-b border-stone-800/50'
      } ${className}`}>
        <div className="max-w-full mx-4 px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="group flex items-center gap-3 hover:opacity-80 transition-opacity duration-300">
              <div className="relative w-8 h-8">
                <Image
                  src={Logo}
                  alt="Routopia Logo"
                  width={36}
                  height={36}
                  className="w-8 h-8"
                  priority
                />
              </div>
              <span className="text-lg font-medium text-stone-200">
                Routopia
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {!isLandingPage && (
                <Link
                  href="/route-planner"
                  className="text-sm text-stone-300 hover:text-stone-200 transition-colors duration-200"
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
                  className="flex items-center gap-2 text-sm text-stone-300 hover:text-stone-200 transition-colors duration-200"
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
              <>
                <Link
                  href="/route-planner"
                  className="block px-3 py-2 rounded-md text-base font-medium text-stone-300 hover:text-white hover:bg-stone-800"
                >
                  Route Planner
                </Link>
              </>
            )}
            {user ? (
              <div className="px-3 py-2 flex items-center gap-3">
                <span className="text-sm text-stone-300">{user.name}</span>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-stone-300 hover:text-white"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                className="block w-full px-3 py-2 rounded-md text-base font-medium text-stone-300 hover:text-white hover:bg-stone-800"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Add SignUpModal */}
      <SignUpModal 
        isOpen={isSignUpOpen}
        onClose={() => setIsSignUpOpen(false)}
      />
    </>
  );
};