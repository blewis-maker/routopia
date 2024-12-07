'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronDown, UserCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { combineClasses, getTypographyClass } from '@/utils/formatters';
import SignUpModal from '@/components/SignUpModal';
import VideoBackground from '@/components/landing/VideoBackground';
import Features from '@/components/landing/Features';

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    setIsVisible(true);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="relative">
      <SignUpModal isOpen={isSignUpModalOpen} onClose={() => setIsSignUpModalOpen(false)} />

      {/* Navbar */}
      <header className={combineClasses(
        "fixed top-0 left-0 right-0 z-50",
        "transition-all duration-500",
        isScrolled ? "bg-black/80 backdrop-blur-sm shadow-lg" : "bg-transparent",
        "py-4"
      )}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <Image
                src="/routopia-logo.png"
                alt="Routopia"
                width={40}
                height={40}
                className={combineClasses(
                  "h-10 w-auto",
                  "transition-transform duration-300",
                  "group-hover:scale-110"
                )}
              />
              <span className={combineClasses(
                "ml-3 text-white font-bold",
                getTypographyClass('2xl'),
                "font-montserrat tracking-tight"
              )}>Routopia</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Route Planner', 'POI Explorer', 'Activity Hub'].map((item) => (
              <Link
                key={item}
                href={item === 'Features' ? '#features' : `/${item.toLowerCase().replace(' ', '-')}`}
                className={combineClasses(
                  "text-white/80 hover:text-white",
                  "transition-colors duration-300",
                  "font-inter",
                  getTypographyClass('base'),
                  "hover:scale-105 transform"
                )}
              >
                {item}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className={combineClasses(
                "text-white/80 hover:text-white",
                "transition-colors duration-300",
                "font-inter",
                getTypographyClass('base'),
                "flex items-center gap-2"
              )}
            >
              <UserCircle className="w-5 h-5" />
              Login
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen">
        <div className="absolute inset-0 z-0">
          <VideoBackground
            videoUrl="/hero-bg.mp4"
            posterUrl="/routopia-logo.png"
          />
        </div>
        
        <div className={combineClasses(
          "relative z-10 flex items-center justify-center min-h-screen",
          "transition-opacity duration-1000",
          isVisible ? "opacity-100" : "opacity-0"
        )}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="max-w-3xl">            
              <h1 className={combineClasses(
                "font-montserrat tracking-tight font-extrabold text-white",
                getTypographyClass('5xl'),
                "animate-fade-in-up"
              )}>
                <span className="block mb-2">Discover Your</span>
                <span className={combineClasses(
                  "block bg-gradient-to-r from-teal-400 to-emerald-400",
                  "text-transparent bg-clip-text",
                  "animate-gradient-text"
                )}>
                  Perfect Route
                </span>
              </h1>
              
              <p className={combineClasses(
                "mt-8 text-white/90 max-w-2xl",
                "font-inter leading-relaxed",
                getTypographyClass('xl'),
                "animate-fade-in-up"
              )} style={{ animationDelay: '0.2s' }}>
                AI-powered route planning that adapts to your preferences, weather conditions, and points of interest.
                Experience smarter navigation for your outdoor adventures.
              </p>
              
              <div className={combineClasses(
                "mt-12 flex flex-col sm:flex-row sm:items-center gap-6",
                "animate-fade-in-up"
              )} style={{ animationDelay: '0.4s' }}>
                <button 
                  onClick={() => setIsSignUpModalOpen(true)}
                  className={combineClasses(
                    "inline-flex items-center justify-center",
                    "px-8 py-4",
                    "font-inter font-medium",
                    getTypographyClass('base'),
                    "rounded-lg",
                    "text-white",
                    "bg-teal-500",
                    "hover:bg-teal-400",
                    "transform hover:scale-105",
                    "transition-all duration-300",
                    "shadow-lg hover:shadow-teal-500/25"
                  )}
                >
                  Get Started
                  <ArrowRight className="ml-3 -mr-1 h-5 w-5 animate-bounce-x" />
                </button>
                
                <Link
                  href="#features"
                  className={combineClasses(
                    "inline-flex items-center justify-center",
                    "px-8 py-4",
                    "font-inter font-medium",
                    getTypographyClass('base'),
                    "rounded-lg",
                    "text-white",
                    "border-2 border-white/20",
                    "hover:bg-white/10",
                    "backdrop-blur-sm",
                    "transform hover:scale-105",
                    "transition-all duration-300"
                  )}
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <button 
          onClick={() => {
            document.getElementById('features')?.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            });
          }}
          className={combineClasses(
            "absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10",
            "flex flex-col items-center gap-2",
            "text-white/60 hover:text-white",
            "transition-all duration-300",
            "animate-bounce cursor-pointer",
            "group"
          )}
        >
          <span className={combineClasses(
            "text-sm font-medium",
            "font-inter",
            "transition-transform duration-300",
            "group-hover:transform group-hover:-translate-y-1"
          )}>
            Scroll to explore
          </span>
          <ChevronDown className={combineClasses(
            "h-6 w-6",
            "transition-transform duration-300",
            "group-hover:transform group-hover:translate-y-1"
          )} />
        </button>
      </section>

      {/* Features Section */}
      <Features />
    </main>
  );
}