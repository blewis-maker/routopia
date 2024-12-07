'use client';

import React from 'react';
import Link from 'next/link';

interface NavigationBarProps {
  user?: {
    name: string;
    image?: string;
  };
  onSignIn?: () => void;
  onSignOut?: () => void;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  user,
  onSignIn,
  onSignOut,
}) => {
  return (
    <nav className="h-16 px-4 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
      {/* Logo & Brand */}
      <div className="flex items-center space-x-2">
        <Link href="/" className="text-xl font-semibold text-brand-primary-500">
          🗺️ Routopia
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="hidden md:flex items-center space-x-6">
        <Link
          href="/route-planner"
          className="text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          Route Planner
        </Link>
        <Link
          href="/activity-hub"
          className="text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          Activity Hub
        </Link>
        <Link
          href="/poi-explorer"
          className="text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          POI Explorer
        </Link>
      </div>

      {/* User Menu */}
      <div className="flex items-center space-x-4">
        {user ? (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-neutral-600 dark:text-neutral-300">
              {user.name}
            </span>
            {user.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-brand-primary-100 dark:bg-brand-primary-900 flex items-center justify-center">
                <span className="text-sm font-medium text-brand-primary-700 dark:text-brand-primary-300">
                  {user.name[0]}
                </span>
              </div>
            )}
            <button
              onClick={onSignOut}
              className="text-sm text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={onSignIn}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-primary-500 rounded-lg hover:bg-brand-primary-600 transition-colors"
          >
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}; 