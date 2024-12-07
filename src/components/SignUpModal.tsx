'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';

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
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-sm rounded-xl bg-stone-900 p-6 w-full">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold text-white">Routopia</span>
            </div>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-center text-stone-300 mb-6">
            Plan your next adventure with AI-powered inspiration. Join our community of explorers.
          </p>

          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-white text-stone-900 rounded-lg p-3 font-medium hover:bg-stone-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <img src="/google.svg" alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>

          <button
            className="w-full mt-3 flex items-center justify-center gap-2 bg-black text-white border border-stone-700 rounded-lg p-3 font-medium hover:bg-stone-800 transition-colors"
          >
            <img src="/apple.svg" alt="Apple" className="w-5 h-5" />
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

          <form onSubmit={handleEmailSignIn}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full bg-stone-800 rounded-lg p-3 text-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              type="submit"
              className="w-full mt-3 bg-teal-600 text-white rounded-lg p-3 font-medium hover:bg-teal-500 transition-colors"
            >
              Continue with Email
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-stone-500">
            <p>
              Already have an account?{' '}
              <button onClick={() => {}} className="text-teal-500 hover:text-teal-400">
                Log In
              </button>
            </p>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 