'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignUpModal({ isOpen, onClose }: SignUpModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Starting Google sign in...');
      const result = await signIn('google', {
        redirect: false,
        callbackUrl: '/routes'
      });
      console.log('Sign in result:', result);

      if (result?.error) {
        setError(result.error);
        console.error('Sign in error:', result.error);
      } else if (result?.ok && result.url) {
        console.log('Sign in successful, redirecting to:', result.url);
        router.push(result.url);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError('An error occurred during sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-stone-900 rounded-lg p-8 max-w-md w-full mx-4 border border-stone-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-stone-50">Explore Like Never Before</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-300">
            <X className="h-6 w-6" />
          </button>
        </div>

        <p className="text-stone-300 text-center mb-8">
          Plan your next adventure with AI-powered inspiration. Join our community of explorers.
        </p>

        {error && (
          <div className="p-3 mb-4 text-sm text-red-500 bg-red-100/10 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <Button 
            onClick={handleGoogleSignIn}
            className="w-full bg-white hover:bg-gray-100 text-stone-900 font-semibold flex items-center justify-center gap-2"
            variant="outline"
            disabled={isLoading}
          >
            <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
            {isLoading ? 'Signing in...' : 'Continue with Google'}
          </Button>

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

          <Button 
            className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold"
            disabled // Temporarily disabled until email auth is set up
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