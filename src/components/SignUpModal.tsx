'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import Image from 'next/image';
import Logo from '@/assets/icons/routopia-logo.png';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignUpModal({ isOpen, onClose }: SignUpModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signIn('google', { 
        callbackUrl: '/dashboard',
        redirect: true,
      });
    } catch (error) {
      console.error('Google sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    // Implement email sign in logic
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" onClick={onClose} />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-[360px] rounded-2xl bg-stone-900/90 backdrop-blur-sm p-6 w-full shadow-xl border border-stone-800">
          <div className="flex flex-col items-center mb-8">
            <h2 className="text-[22px] font-semibold text-white text-center mb-1.5 tracking-wide">
              AI-Powered Inspiration
            </h2>
            <p className="text-center text-[15px] text-stone-400 font-light tracking-wide">
              for Your Next Adventure
            </p>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-stone-900 rounded-xl p-3 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <button className="w-full mt-3 flex items-center justify-center gap-3 bg-black hover:bg-stone-800 text-white border border-stone-700 rounded-xl p-3 font-medium transition-all duration-200 shadow-sm">
            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
              <path fill="currentColor" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
            </svg>
            Continue with Apple
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-stone-900 text-stone-500">or</span>
            </div>
          </div>

          <form onSubmit={handleEmailSignIn} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full bg-stone-800/50 rounded-xl p-3 text-white placeholder:text-stone-500 
                       focus:outline-none focus:ring-2 focus:ring-teal-500/50 border border-stone-700/50
                       transition-all duration-200 text-sm"
            />
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl p-3 
                       font-medium hover:from-teal-400 hover:to-emerald-400 transition-all duration-200
                       shadow-lg shadow-teal-500/20"
            >
              Continue with Email
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-stone-500">
            <p>
              Already have an account?{' '}
              <button onClick={() => signIn()} className="text-teal-500 hover:text-teal-400 transition-colors">
                Log In
              </button>
            </p>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 