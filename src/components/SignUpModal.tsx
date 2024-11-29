'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignUpModal({ isOpen, onClose }: SignUpModalProps) {
  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      await signIn('google', { callbackUrl: '/routes' });
    } catch (error) {
      console.error('Google sign in error:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-stone-900 rounded-lg p-8 max-w-md w-full mx-4 border border-stone-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-stone-50">Community-Powered Motivation</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-300">
            <X className="h-6 w-6" />
          </button>
        </div>

        <p className="text-stone-300 text-center mb-8">
          Plan your next adventure with AI-powered inspiration. Join our community of explorers.
        </p>

        <div className="space-y-4">
          <Button 
            onClick={handleGoogleSignIn}
            className="w-full bg-white hover:bg-gray-100 text-stone-900 font-semibold flex items-center justify-center gap-2"
            variant="outline"
          >
            <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
            Continue with Google
          </Button>

          {/* Apple Sign In - Updated styling */}
          <Button 
            className="w-full bg-black hover:bg-stone-800 text-white font-semibold flex items-center justify-center gap-2"
            variant="outline"
            disabled // Temporarily disabled until Apple auth is set up
          >
            <img src="/apple-icon.svg" alt="Apple" className="w-5 h-5 text-white fill-white" />
            <span className="text-white">Continue with Apple</span>
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-stone-900 text-stone-400">or</span>
            </div>
          </div>

          {/* Email Sign In */}
          <Button 
            className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold"
          >
            Continue with Email
          </Button>

          <div className="text-center text-stone-400 text-sm mt-6">
            <p>Already have an account? {' '}
              <button className="text-teal-400 hover:text-teal-300" onClick={onClose}>
                Log In
              </button>
            </p>
          </div>

          <div className="text-center text-stone-400 text-xs mt-4">
            By continuing, you agree to our{' '}
            <a href="#" className="text-teal-400 hover:text-teal-300">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-teal-400 hover:text-teal-300">Privacy Policy</a>
          </div>
        </div>
      </div>
    </div>
  );
} 