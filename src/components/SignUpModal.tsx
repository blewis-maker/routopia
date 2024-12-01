'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignUpModal({ isOpen, onClose }: SignUpModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLogoAnimated, setIsLogoAnimated] = useState(false);
  const router = useRouter();

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await signIn('google', {
        callbackUrl: '/routopia',
        redirect: false
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        router.push('/routopia');
      }
    } catch (error) {
      setError('An error occurred during sign in');
      console.error('Sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleButtonHover = (isHovered: boolean) => {
    setIsLogoAnimated(isHovered);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      <div className="bg-stone-900 rounded-lg p-8 max-w-md w-full mx-4 border border-stone-800">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center flex-grow justify-center">
            <div className="flex items-center">
              <Image
                src="/logo.png"
                alt="Routopia"
                className={`h-8 w-8 mr-2 ${isLogoAnimated ? 'animate-logo-active' : ''}`}
                width={32}
                height={32}
                priority
              />
              <span className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
                Routopia
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-300 absolute right-6 top-6">
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
            onMouseEnter={() => handleButtonHover(true)}
            onMouseLeave={() => handleButtonHover(false)}
            className="w-full bg-white hover:bg-gray-100 text-stone-900 font-semibold flex items-center justify-center gap-2"
            variant="outline"
            disabled={isLoading}
          >
            <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
            {isLoading ? 'Signing in...' : 'Continue with Google'}
          </Button>

          <Button 
            onMouseEnter={() => handleButtonHover(true)}
            onMouseLeave={() => handleButtonHover(false)}
            className="w-full bg-black hover:bg-stone-800 text-white font-semibold flex items-center justify-center gap-2"
            variant="outline"
            disabled
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
            onMouseEnter={() => handleButtonHover(true)}
            onMouseLeave={() => handleButtonHover(false)}
            className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold"
            disabled
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