'use client';

import Link from 'next/link';
import { User } from 'next-auth';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
import { Settings, LogOut } from 'lucide-react';
import { useClickOutside } from '@/hooks/useClickOutside';

interface NavigationBarProps {
  user?: User | null;
  isLandingPage?: boolean;
}

const menuItemStyles = {
  wrapper: cn(
    "flex items-center gap-2",
    "px-4 py-2",
    "text-sm text-stone-300",
    "transition-colors duration-200",
    "w-full text-left"
  ),
  icon: cn(
    "w-4 h-4",
    "transition-colors duration-200",
    "group-hover:text-teal-500"
  )
};

export function NavigationBar({ user, isLandingPage = false }: NavigationBarProps) {
  const pathname = usePathname();
  const isRoutePlanner = pathname === '/route-planner';
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Create ref using the hook
  const dropdownRef = useClickOutside(() => {
    setIsUserMenuOpen(false);
  });

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50',
      'border-b border-stone-800/50',
      'bg-[#1B1B1B]/95 backdrop-blur-sm',
      isLandingPage && 'bg-transparent border-transparent'
    )}>
      <div className="max-w-full mx-4 px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <Link 
            href="/" 
            className="flex items-center gap-3 group"
          >
            <svg 
              className={cn(
                "w-6 h-6",
                "text-teal-500",
                "animate-logo-blink"
              )}
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
            <span className={cn(
              "font-sans font-medium text-stone-200",
              "group-hover:text-teal-500 transition-colors duration-200"
            )}>
              Routopia
            </span>
          </Link>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {!isRoutePlanner && (
                  <Link
                    href="/route-planner"
                    className={cn(
                      "text-sm font-sans font-medium",
                      "text-stone-300 hover:text-teal-500",
                      "transition-colors duration-200"
                    )}
                  >
                    Route Planner
                  </Link>
                )}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className={cn(
                      "w-9 h-9 rounded-full",
                      "bg-stone-950/80",
                      "border border-stone-800/50",
                      "flex items-center justify-center",
                      "shadow-lg",
                      "hover:border-teal-500/50",
                      "hover:shadow-teal-500/20",
                      "transition-all duration-200",
                      "backdrop-blur-sm"
                    )}
                  >
                    <span className="text-sm font-sans font-medium text-stone-200">
                      {user.name?.[0] || '?'}
                    </span>
                  </button>

                  {isUserMenuOpen && (
                    <div 
                      ref={dropdownRef}
                      className={cn(
                        "absolute right-0 mt-2",
                        "w-48",
                        "bg-stone-950/80",
                        "backdrop-blur-md",
                        "border border-stone-800/50",
                        "rounded-lg",
                        "shadow-lg shadow-black/10",
                        "py-1",
                        "z-50"
                      )}>
                      <div className={cn(
                        "px-4 py-2",
                        "border-b border-stone-800/50"
                      )}>
                        <p className="text-sm font-medium text-stone-200">
                          {user.name}
                        </p>
                        <p className="text-xs text-stone-400">
                          {user.email}
                        </p>
                      </div>
                      
                      <Link
                        href="/settings"
                        className={cn(
                          menuItemStyles.wrapper,
                          "group"
                        )}
                      >
                        <Settings className={menuItemStyles.icon} />
                        <span>Settings</span>
                      </Link>

                      <button
                        onClick={() => signOut()}
                        className={cn(
                          menuItemStyles.wrapper,
                          "group"
                        )}
                      >
                        <LogOut className={menuItemStyles.icon} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className={cn(
                  "text-sm font-sans font-medium",
                  "text-stone-300 hover:text-teal-500",
                  "transition-colors duration-200"
                )}
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