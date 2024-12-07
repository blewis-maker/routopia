'use client';

import Link from 'next/link';
import { MapPin, Navigation, Route, Compass, ArrowRight, Play } from 'lucide-react';
import VideoBackground from '@/components/landing/VideoBackground';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        <VideoBackground
          videoUrl="/hero-bg.mp4"
          posterUrl="/routopia-logo.png"
        />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl mx-auto lg:mx-0">
            <h1 className="font-montserrat text-5xl sm:text-6xl lg:text-7xl tracking-tight font-extrabold text-white animate-fade-in-up">
              <span className="block mb-2">Discover Your</span>
              <span className="block bg-gradient-to-r from-brand-primary to-emerald-400 text-transparent bg-clip-text animate-gradient-text">
                Perfect Route
              </span>
            </h1>
            
            <p className="mt-8 font-inter text-xl leading-relaxed text-white/90 max-w-2xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              AI-powered route planning that adapts to your preferences, weather conditions, and points of interest.
              Experience smarter navigation for your outdoor adventures.
            </p>
            
            <div className="mt-12 flex flex-col sm:flex-row sm:items-center gap-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <Link 
                href="/routopia"
                className="
                  inline-flex items-center justify-center 
                  px-8 py-4 
                  text-base font-medium
                  rounded-lg 
                  text-white 
                  bg-brand-primary
                  hover:bg-brand-primary/90
                  transform hover:scale-105
                  transition-all duration-300
                  shadow-lg hover:shadow-brand-primary/25
                "
              >
                Get Started
                <ArrowRight className="ml-3 -mr-1 h-5 w-5 animate-bounce-x" />
              </Link>
              
              <Link
                href="#features"
                className="
                  inline-flex items-center justify-center 
                  px-8 py-4 
                  text-base font-medium
                  rounded-lg 
                  text-white 
                  border-2 border-white/20
                  hover:bg-white/10 
                  backdrop-blur-sm
                  transform hover:scale-105
                  transition-all duration-300
                "
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24 sm:py-32 bg-brand-offwhite">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-montserrat text-base font-semibold text-brand-primary tracking-wide uppercase">
              Features
            </h2>
            <p className="mt-2 font-montserrat text-3xl font-extrabold text-brand-text sm:text-4xl">
              Everything you need for smarter navigation
            </p>
            <p className="mt-4 max-w-2xl mx-auto font-inter text-xl text-brand-text/80">
              Experience the future of route planning with our comprehensive set of features.
            </p>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-2">
              {[
                {
                  title: 'AI Route Generation',
                  description: 'Intelligent pathfinding that considers your preferences, terrain, and points of interest.',
                  icon: Route,
                },
                {
                  title: 'Smart POI Discovery',
                  description: 'Automatically discover and integrate interesting locations along your journey.',
                  icon: MapPin,
                },
                {
                  title: 'Real-time Navigation',
                  description: 'Turn-by-turn directions with live updates and route optimization.',
                  icon: Navigation,
                },
                {
                  title: 'Weather Integration',
                  description: 'Plan around weather conditions with integrated forecasts and alerts.',
                  icon: Compass,
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="relative flex flex-col gap-6 p-8 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg bg-brand-primary/10">
                      <feature.icon className="h-6 w-6 text-brand-primary" />
                    </div>
                    <h3 className="font-montserrat text-xl font-semibold text-brand-text">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="font-inter text-brand-text/80 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 sm:py-24 bg-gradient-to-b from-brand-offwhite to-white">
        <div className="max-w-7xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="font-montserrat text-3xl font-extrabold tracking-tight text-brand-text sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block text-brand-primary mt-2">
              Start planning your next adventure today.
            </span>
          </h2>
          <div className="mt-8">
            <Link
              href="/routopia"
              className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-brand-primary hover:bg-brand-primary/90 transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              Get Started
              <ArrowRight className="ml-2 -mr-1 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}