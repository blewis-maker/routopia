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
        className="flex items-center justify-center px-4 py-2 border border-stone-700 rounded-lg hover:bg-stone-800 transition-colors"
      >
        <img src="/google-icon.svg" alt="Google" className="w-6 h-6 mr-3" />
        <span>Continue with Google</span>
      </button>
    </div>
  );
} 