'use client';

import React from 'react';
import Link from 'next/link';
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

          {/* Rest of navigation bar content... */}
        </div>
      </div>
    </nav>
  );
};