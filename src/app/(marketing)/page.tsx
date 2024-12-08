'use client';

import { useState, useEffect } from 'react';
import { Text, Heading } from '@/components/common/Typography';
import SignUpModal from '@/components/SignUpModal';
import VideoBackground from '@/components/landing/VideoBackground';
import Features from '@/components/landing/Features';
import { useTheme } from '@/styles/theme';

export default function LandingPage() {
  const theme = useTheme();
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 200); // Slightly delayed after AppShell
    return () => clearTimeout(timer);
  }, []);

  const scrollToLearnMore = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative scrollbar-none">
      {/* Hero Section */}
      <div className={`relative min-h-screen transition-all duration-700 ease-out scrollbar-none ${
        mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>
        {/* Video Background */}
        <VideoBackground videoUrl="/hero-bg.mp4" />

        {/* Hero Content */}
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-4">
              <Heading 
                level={1}
                className="font-montserrat text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight"
              >
                <span className="text-gradient-brand inline-block transform hover:scale-105 transition-transform duration-300">Discover</span>{' '}
                <span className="text-white">Your</span>{' '}
                <span className="text-white">Perfect Route</span>
              </Heading>

              <Text 
                variant="xl"
                className="text-neutral-300 max-w-2xl mx-auto font-light leading-relaxed tracking-wide"
              >
                Experience intelligent route planning powered by AI that adapts to your preferences,
                <br className="hidden md:block" /> weather conditions, and points of interest.
              </Text>
            </div>

            <div className="flex flex-col items-center space-y-8">
              <button
                onClick={() => setIsSignUpOpen(true)}
                className="btn-primary px-8 py-4 text-lg rounded-xl bg-gradient-brand hover:opacity-90 transition-all duration-200 transform hover:scale-105 hover:shadow-lg hover:shadow-teal-500/20"
              >
                Get Started
              </button>

              <div className="flex items-center gap-4 text-sm text-neutral-400">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Free to start</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>No credit card required</span>
                </div>
              </div>
            </div>
          </div>

          {/* Learn More Arrow */}
          <button 
            onClick={scrollToLearnMore}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 text-neutral-400 hover:text-white transition-all duration-300 flex flex-col items-center gap-3 group cursor-pointer"
            aria-label="Learn More"
          >
            <Text variant="sm" className="tracking-wider uppercase opacity-80 group-hover:opacity-100 font-medium">
              Learn More
            </Text>
            <div className="w-5 h-5 border-b-2 border-r-2 border-current transform rotate-45 transition-transform duration-300 group-hover:translate-y-1 animate-bounce-subtle" />
          </button>
        </div>

        <SignUpModal 
          isOpen={isSignUpOpen}
          onClose={() => setIsSignUpOpen(false)}
        />
      </div>

      {/* Features Section */}
      <Features />
    </div>
  );
}