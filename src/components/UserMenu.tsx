'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export function UserMenu() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle mouse enter/leave for the entire menu
  const handleMouseEnter = () => setIsOpen(true);
  const handleMouseLeave = () => setIsOpen(false);

  return (
    <div 
      className="relative" 
      ref={menuRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center">
        <img
          src={session?.user?.image || '/default-avatar.png'}
          alt="Profile"
          className="w-8 h-8 rounded-full border border-stone-700 hover:border-stone-500 transition-colors"
        />
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md bg-stone-800 shadow-lg ring-1 ring-black ring-opacity-5 py-1">
          <Link
            href="/profile"
            className="block px-4 py-2 text-sm text-stone-200 hover:bg-stone-700"
          >
            My Profile
          </Link>
          <Link
            href="/settings"
            className="block px-4 py-2 text-sm text-stone-200 hover:bg-stone-700"
          >
            Settings
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="block w-full text-left px-4 py-2 text-sm text-stone-200 hover:bg-stone-700"
          >
            Log Out
          </button>
        </div>
      )}
    </div>
  );
} 