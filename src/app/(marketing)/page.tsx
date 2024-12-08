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
    <div className="relative">
      {/* Hero Section */}
      <div className={`relative min-h-screen transition-all duration-700 ease-out ${
        mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>
        {/* Video Background */}
        <VideoBackground videoUrl="/hero-bg.mp4" />

        {/* Hero Content */}
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <Heading 
              level={1}
              className="mb-6 font-montserrat text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight"
            >
              <span className="text-gradient-brand">Discover</span>{' '}
              <span className="text-white">Your Perfect Route</span>
            </Heading>

            <Text 
              variant="xl"
              className="mb-12 text-neutral-300 max-w-2xl mx-auto font-light leading-relaxed"
            >
              AI-powered route planning that adapts to your preferences, weather conditions, and points of interest.
            </Text>

            <button
              onClick={() => setIsSignUpOpen(true)}
              className="btn-primary px-8 py-4 text-lg rounded-xl bg-gradient-brand hover:opacity-90 transition-all duration-200"
            >
              Get Started
            </button>
          </div>

          {/* Learn More Arrow - Updated animation */}
          <button 
            onClick={scrollToLearnMore}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-neutral-400 hover:text-neutral-200 transition-all duration-300 flex flex-col items-center gap-3 group"
          >
            <Text variant="sm" className="tracking-wider uppercase">Learn More</Text>
            <div className="w-6 h-6 border-b-2 border-r-2 border-current rotate-45 animate-bounce-slow group-hover:border-white" />
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