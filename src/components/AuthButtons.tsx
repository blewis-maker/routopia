'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';

export function AuthButtons() {
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      const result = await signIn('google', {
        callbackUrl: '/routopia',
        redirect: false,
      });
      
      if (result?.error) {
        setError(result.error);
      } else if (result?.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      setError('An error occurred during sign in');
      console.error('Sign in error:', error);
    }
  };

  return (
    <div className="flex flex-col space-y-4 min-w-[300px]">
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-100/10 rounded-md">
          {error}
        </div>
      )}
      <button
        onClick={handleGoogleSignIn}
        className="flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-lg
          bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300
          transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg
          hover:shadow-teal-500/25"
      >
        <img src="/google-icon.svg" alt="Google" className="w-6 h-6 mr-3" />
        <span>Continue with Google</span>
      </button>
    </div>
  );
} 