'use client';

import { signIn } from 'next-auth/react';
import { X } from 'lucide-react';
import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { combineClasses } from '@/utils/formatters';
import { Text, Heading } from '@/components/common/Typography';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'login' | 'signup';
}

export default function SignUpModal({ isOpen, onClose, mode = 'signup' }: SignUpModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [isValidEmail, setIsValidEmail] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (newEmail) {
      setIsValidEmail(validateEmail(newEmail));
    } else {
      setIsValidEmail(true);
    }
  };

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !isValidEmail) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await signIn('email', {
        email,
        callbackUrl: '/routopia',
        redirect: false
      });

      if (result?.error) {
        setError(result.error);
      } else {
        setError('Check your email for a login link!');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await signIn('apple', {
        callbackUrl: '/routopia',
        redirect: false
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        router.push('/routopia');
      }
    } catch (error) {
      setError('Apple sign in is not available yet');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={combineClasses(
        "fixed inset-0 bg-black/90 backdrop-blur-sm z-50",
        "flex items-center justify-center",
        "transition-all duration-300"
      )}
      onClick={handleBackdropClick}
    >
      <div className={combineClasses(
        "bg-black rounded-2xl p-8 max-w-md w-full mx-4",
        "shadow-xl shadow-black/20",
        "transform transition-all duration-300",
        "animate-fade-in-up"
      )}>
        {/* Close button */}
        <div className="flex justify-end mb-2">
          <button 
            onClick={onClose}
            className="text-stone-400 hover:text-stone-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Centered Logo and Title */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-full flex justify-center">
            <div className="flex items-center">
              <Image
                src="/routopia-logo.png"
                alt="Routopia"
                width={32}
                height={32}
                className="w-8 h-8 absolute -translate-x-[calc(100%+8px)]"
              />
              <Text 
                as="span"
                variant="2xl"
                className="font-montserrat font-semibold text-white"
              >
                Routopia
              </Text>
            </div>
          </div>

          {/* Description */}
          <Text 
            className="text-stone-300 text-center mt-4 max-w-[80%]"
            variant="base"
          >
            Plan your next adventure with AI-powered inspiration. Join our community of explorers.
          </Text>
        </div>

        {error && (
          <div className={combineClasses(
            "mb-6 p-4 rounded-lg",
            error.includes('Check your email')
              ? "bg-teal-500/10 border border-teal-500/20"
              : "bg-red-500/10 border border-red-500/20",
            "animate-fade-in"
          )}>
            <Text 
              variant="sm" 
              className={error.includes('Check your email')
                ? "text-teal-400"
                : "text-red-400"
              }
            >
              {error}
            </Text>
          </div>
        )}

        {/* Auth Buttons */}
        <div className="space-y-3">
          <button 
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className={combineClasses(
              "w-full h-12 rounded-lg",
              "flex items-center justify-center gap-3",
              "bg-white hover:bg-gray-50",
              "transition-all duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "font-inter"
            )}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                <Text as="span" variant="sm" className="text-black font-medium">
                  Signing in...
                </Text>
              </div>
            ) : (
              <>
                <Image 
                  src="/google-icon.svg" 
                  alt="Google" 
                  width={20} 
                  height={20} 
                  className="w-5 h-5"
                />
                <Text as="span" variant="sm" className="text-black font-medium">
                  Continue with Google
                </Text>
              </>
            )}
          </button>

          <button 
            onClick={handleAppleSignIn}
            disabled={true}
            title="Apple sign in coming soon"
            className={combineClasses(
              "w-full h-12 rounded-lg",
              "flex items-center justify-center gap-3",
              "bg-black/80",
              "border border-stone-800",
              "transition-all duration-200",
              "hover:bg-stone-900 cursor-not-allowed",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "font-inter"
            )}
          >
            <Image 
              src="/apple-icon.svg" 
              alt="Apple" 
              width={20} 
              height={20} 
              className="w-5 h-5 invert"
            />
            <Text as="span" variant="sm" className="text-white font-medium">
              Continue with Apple
            </Text>
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-800/50"></div>
            </div>
            <div className="relative flex justify-center">
              <Text as="span" variant="sm" className="px-2 bg-black text-stone-600">
                or
              </Text>
            </div>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter your email"
              className={combineClasses(
                "w-full h-12 px-4 rounded-lg",
                "bg-stone-900",
                "text-white placeholder-stone-500",
                "focus:outline-none focus:ring-1",
                !isValidEmail && email 
                  ? "ring-1 ring-red-500/50 focus:ring-red-500/50"
                  : "focus:ring-teal-500/50",
                "transition-all duration-200",
                "font-inter text-sm"
              )}
            />
            {!isValidEmail && email && (
              <Text variant="xs" className="text-red-400 mt-1">
                Please enter a valid email address
              </Text>
            )}
            <button 
              type="submit"
              disabled={isLoading || !email}
              className={combineClasses(
                "w-full h-12 rounded-lg",
                "bg-teal-600 hover:bg-teal-500",
                "text-white font-medium",
                "transition-all duration-200",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "font-inter text-sm"
              )}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                'Continue with Email'
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <Text variant="sm" className="text-stone-400">
              Already have an account?{' '}
              <button 
                onClick={() => router.push('/login')}
                className="text-teal-500 hover:text-teal-400 transition-colors font-medium"
              >
                Log In
              </button>
            </Text>
          </div>

          <div className="text-center mt-4">
            <Text variant="xs" className="text-stone-600">
              By continuing, you agree to our{' '}
              <a href="/terms" className="text-teal-500 hover:text-teal-400 transition-colors">
                Terms of Service
              </a>
              {' '}and{' '}
              <a href="/privacy" className="text-teal-500 hover:text-teal-400 transition-colors">
                Privacy Policy
              </a>
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
} 