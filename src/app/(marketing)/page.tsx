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
      <div className={`relative min-h-screen transition-opacity duration-500 ${
        mounted ? 'opacity-100' : 'opacity-0'
      }`}>
        {/* Video Background */}
        <VideoBackground videoUrl="/hero-bg.mp4" />

        {/* Hero Content */}
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <Heading 
              level={1}
              className="mb-6 font-montserrat marketing-text-gradient"
            >
              Discover Your Perfect Route
            </Heading>

            <Text 
              variant="xl"
              className="mb-8 text-neutral-300 max-w-2xl mx-auto"
            >
              AI-powered route planning that adapts to your preferences, weather conditions, and points of interest.
            </Text>

            <button
              onClick={() => setIsSignUpOpen(true)}
              className="btn-primary"
            >
              Get Started
            </button>
          </div>

          {/* Learn More Arrow */}
          <button 
            onClick={scrollToLearnMore}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-neutral-400 hover:text-neutral-200 transition-colors flex flex-col items-center gap-2"
          >
            <Text variant="sm">Learn More</Text>
            <div className="w-6 h-6 border-b-2 border-r-2 border-current rotate-45 animate-bounce-slow" />
          </button>
        </div>

        {/* Sign Up Modal */}
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