'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function UserAvatar() {
  const { data: session, update } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const closeTimeout = useRef<NodeJS.Timeout>();

  const defaultAvatar = '/default-avatar.png';

  const handleMouseEnter = () => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeout.current = setTimeout(() => {
      setIsOpen(false);
    }, 800);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload-avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const { imageUrl } = await response.json();

      await update({
        ...session,
        user: {
          ...session?.user,
          image: imageUrl,
        },
      });

    } catch (error) {
      console.error('Error uploading avatar:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={`
        w-10 h-10 rounded-full 
        overflow-hidden
        border-2 transition-all duration-300
        ${isOpen ? 'border-teal-500 scale-105' : 'border-stone-700 hover:border-stone-500'}
        ${isUploading ? 'opacity-50' : ''}
        relative group cursor-pointer
      `}
        onClick={() => fileInputRef.current?.click()}
      >
        <Image
          src={session?.user?.image || defaultAvatar}
          alt="Profile"
          width={40}
          height={40}
          className="w-full h-full rounded-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-white text-xs">Change</span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleImageUpload}
        />
      </div>

      {/* Dropdown Menu */}
      <div 
        ref={dropdownRef}
        className={`
          absolute right-0 mt-2 w-48 rounded-md shadow-lg
          bg-stone-800 ring-1 ring-black ring-opacity-5
          transform transition-all duration-300 ease-out
          ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}
          z-50
        `}
      >
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
            className="block w-full text-left px-4 py-2 text-sm text-stone-200 hover:bg-stone-700 transition-colors duration-150"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
} 