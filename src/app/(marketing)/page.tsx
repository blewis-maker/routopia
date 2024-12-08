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
          <div className="max-w-5xl mx-auto space-y-12">
            <div className={`space-y-8 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
              <Heading 
                level={1}
                className="font-montserrat text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight flex flex-col items-center gap-4"
              >
                <span className="text-gradient-brand inline-block animate-text-glow hover:animate-text-pulse">
                  Discover
                </span>
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-slide-up delay-200">
                    <span className="text-white">Your Perfect</span>
                  </div>
                  <div className="animate-slide-up delay-300">
                    <span className="text-white tracking-normal">Route</span>
                  </div>
                </div>
              </Heading>

              <Text 
                variant="xl"
                className="text-neutral-300 max-w-2xl mx-auto font-light leading-relaxed tracking-wide animate-fade-in delay-500 text-lg md:text-xl mt-8"
              >
                Experience intelligent route planning powered by AI that adapts to your
                <br className="hidden md:block" /> preferences, weather conditions, and points of interest.
              </Text>
            </div>

            <div className={`flex flex-col items-center space-y-10 ${mounted ? 'animate-fade-in delay-700' : 'opacity-0'}`}>
              <button
                onClick={() => setIsSignUpOpen(true)}
                className="btn-primary px-10 py-5 text-lg rounded-xl bg-gradient-brand 
                         transition-all duration-300 transform hover:scale-105 
                         hover:shadow-xl hover:shadow-teal-500/20 animate-pulse-teal"
              >
                Get Started
              </button>

              <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-neutral-400">
                <div className="flex items-center gap-2 animate-fade-in delay-800">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="whitespace-nowrap">Free to start</span>
                </div>
                <div className="flex items-center gap-2 animate-fade-in delay-900">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="whitespace-nowrap">No credit card required</span>
                </div>
              </div>
            </div>
          </div>

          {/* Learn More Arrow */}
          <button 
            onClick={scrollToLearnMore}
            className={`absolute bottom-16 left-1/2 -translate-x-1/2 text-neutral-400 
                     hover:text-white transition-all duration-300 flex flex-col items-center 
                     gap-3 group cursor-pointer ${mounted ? 'animate-fade-in delay-1000' : 'opacity-0'}`}
            aria-label="Learn More"
          >
            <Text variant="sm" className="tracking-wider uppercase opacity-80 group-hover:opacity-100 font-medium animate-float">
              Learn More
            </Text>
            <div className="w-5 h-5 border-b-2 border-r-2 border-current transform rotate-45 
                          transition-transform duration-300 group-hover:translate-y-1 animate-bounce-subtle" />
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