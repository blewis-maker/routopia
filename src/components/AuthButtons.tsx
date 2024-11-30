'use client';

import { signIn } from 'next-auth/react';

export function AuthButtons() {
  return (
    <div className="flex flex-col space-y-4 min-w-[300px]">
      <button
        onClick={() => signIn('google', { callbackUrl: '/routes' })}
        className="flex items-center justify-center px-4 py-2 border border-stone-700 rounded-lg hover:bg-stone-800 transition-colors"
      >
        <img src="/google-icon.svg" alt="Google" className="w-6 h-6 mr-3" />
        <span>Continue with Google</span>
      </button>
    </div>
  );
} 