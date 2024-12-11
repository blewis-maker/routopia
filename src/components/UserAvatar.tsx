'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { styleGuide as sg } from '@/styles/theme/styleGuide';

export function UserAvatar() {
  const { data: session, update } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultAvatar = '/default-avatar.png';

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div className={cn(
        "w-8 h-8 rounded-sm overflow-hidden",
        "border transition-all duration-200",
        isOpen ? sg.colors.border.accent : sg.colors.border.secondary,
        isUploading && "opacity-50",
        "relative cursor-pointer"
      )}>
        <Image
          src={session?.user?.image || defaultAvatar}
          alt="Profile"
          width={32}
          height={32}
          className="w-full h-full object-cover"
        />
        
        {isUploading && (
          <div className={cn(
            "absolute inset-0 flex items-center justify-center",
            sg.colors.background.overlay
          )}>
            <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleImageUpload}
        />
      </div>

      {error && (
        <div className={cn(
          "absolute top-full mt-2 right-0 z-50",
          "px-3 py-2 rounded-md",
          "bg-red-500",
          sg.typography.sizes.sm,
          "text-white"
        )}>
          {error}
        </div>
      )}

      {/* Dropdown Menu */}
      <div className={cn(
        "absolute right-0 mt-2 w-48 rounded-md",
        sg.effects.shadow,
        sg.colors.background.primary,
        sg.colors.border.primary,
        "border",
        "transform transition-all duration-200 ease-out",
        isOpen 
          ? "opacity-100 translate-y-0" 
          : "opacity-0 translate-y-2 pointer-events-none",
        "z-50"
      )}>
        <div className="py-1">
          <div className="px-4 py-2 border-b border-stone-700">
            <p className="text-sm font-medium text-white truncate">
              {session?.user?.name}
            </p>
            <p className="text-xs text-stone-400 truncate">
              {session?.user?.email}
            </p>
          </div>
          
          <Link
            href="/profile"
            className="block px-4 py-2 text-sm text-stone-200 hover:bg-stone-700 transition-colors duration-150"
          >
            My Profile
          </Link>
          <Link
            href="/settings"
            className="block px-4 py-2 text-sm text-stone-200 hover:bg-stone-700 transition-colors duration-150"
          >
            Settings
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="block w-full text-left px-4 py-2 text-sm text-stone-200 hover:bg-stone-700 transition-colors duration-150 border-t border-stone-700"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
} 