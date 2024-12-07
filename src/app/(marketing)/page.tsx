'use client';

import { useState, useEffect } from 'react';
import { Text, Heading } from '@/components/common/Typography';
import SignUpModal from '@/components/SignUpModal';
import VideoBackground from '@/components/landing/VideoBackground';
import Features from '@/components/landing/Features';

export default function LandingPage() {
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
              variant="2xl"
              className="mb-6 font-montserrat"
            >
              Discover Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400 animate-gradient-text">
                Perfect Route
              </span>
            </Heading>

            <Text 
              variant="xl"
              className="mb-8 text-stone-300 max-w-2xl mx-auto"
            >
              AI-powered route planning that adapts to your preferences, weather conditions, and points of interest. Experience smarter navigation for your outdoor adventures.
            </Text>

            <button
              onClick={() => setIsSignUpOpen(true)}
              className="px-8 py-4 rounded-lg font-semibold text-lg bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-teal-500/25"
            >
              Get Started
            </button>
          </div>

          {/* Learn More Arrow */}
          <button 
            onClick={scrollToLearnMore}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 flex flex-col items-center gap-2 hover:text-white/75 transition-colors"
          >
            <Text variant="sm">Learn More</Text>
            <div className="w-6 h-6 border-b-2 border-r-2 border-white/50 rotate-45 animate-bounce-slow" />
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