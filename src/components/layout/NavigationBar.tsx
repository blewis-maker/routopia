'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User, Menu, X } from 'lucide-react';
import SignUpModal from '@/components/SignUpModal';
import { useTheme } from '@/styles/theme';
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
        isLandingPage ? 'bg-transparent' : 'glass-effect'
      } ${className}`}>
        <div className="nav-bar__container">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="nav-bar__logo group">
              <div className="relative w-8 h-8">
                <Image
                  src="/routopia-logo.png"
                  alt="Routopia"
                  fill
                  className="nav-bar__logo-image group-hover:scale-110"
                  priority
                />
              </div>
              <span className="nav-bar__logo-text">
                Routopia
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {!isLandingPage && (
                <>
                  <Link
                    href="/route-planner"
                    className="text-stone-300 hover:text-white transition-colors duration-200 font-medium"
                  >
                    Route Planner
                  </Link>
                  <Link
                    href="/activity-hub"
                    className="text-stone-300 hover:text-white transition-colors duration-200 font-medium"
                  >
                    Activity Hub
                  </Link>
                  <Link
                    href="/poi-explorer"
                    className="text-stone-300 hover:text-white transition-colors duration-200 font-medium"
                  >
                    POI Explorer
                  </Link>
                </>
              )}
              {user ? (
                <div className="flex items-center space-x-4">
                  {user?.name && (
                    <span className="text-sm text-stone-300">
                      {user.name}
                    </span>
                  )}
                  {user.image ? (
                    <Image
                      src={user.image || ''}
                      alt={user.name || 'User'}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-teal-900 flex items-center justify-center">
                      <span className="text-sm font-medium text-teal-300">
                        {user.name?.[0] || '?'}
                      </span>
                    </div>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="text-sm text-stone-300 hover:text-white transition-colors duration-200"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSignIn}
                  className="flex items-center gap-2 text-stone-300 hover:text-white transition-colors duration-200 font-medium"
                >
                  <User className="w-4 h-4" />
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-stone-300 hover:text-white"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
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
          bg-stone-900/80 backdrop-blur-md
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
                <Link
                  href="/activity-hub"
                  className="block px-3 py-2 rounded-md text-base font-medium text-stone-300 hover:text-white hover:bg-stone-800"
                >
                  Activity Hub
                </Link>
                <Link
                  href="/poi-explorer"
                  className="block px-3 py-2 rounded-md text-base font-medium text-stone-300 hover:text-white hover:bg-stone-800"
                >
                  POI Explorer
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