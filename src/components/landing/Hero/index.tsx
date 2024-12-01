import { useState } from 'react';
import Image from 'next/image';
import LocationSearch from './LocationSearch';
import MapPreview from './MapPreview';
import ActivityTypeScroller from './ActivityTypeScroller';
import QuickStart from './QuickStart';

export default function Hero() {
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  return (
    <section className="
      relative min-h-screen 
      flex flex-col items-center justify-center
      px-4 sm:px-6 lg:px-8
    ">
      {/* Video Background (keeping your existing implementation) */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/hero-bg.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <div className="absolute inset-0 z-0 bg-black/60" />

      {/* Content */}
      <div className="
        relative z-10 
        flex flex-col items-center justify-center 
        w-full max-w-7xl mx-auto
        space-y-8 sm:space-y-12
      ">
        {/* Logo and Title (enhanced from your current version) */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-16 h-16 mb-4">
            <Image 
              src="/routopia-logo.png"
              alt="Routopia"
              fill
              priority
              className={`object-contain transition-all duration-300 ${
                isButtonHovered ? 'animate-logo-active' : ''
              }`}
            />
          </div>
          <h1 className="text-5xl font-bold">Your AI Route</h1>
          <div className="text-5xl font-bold bg-gradient-to-r from-teal-400 to-emerald-400 text-transparent bg-clip-text leading-relaxed py-2">
            Planning Companion
          </div>
        </div>

        {/* New Components */}
        <div className="
          w-full max-w-4xl mx-auto 
          space-y-6 sm:space-y-8
        ">
          <LocationSearch />
          <div className="
            grid grid-cols-1 
            sm:grid-cols-2 
            lg:grid-cols-3 
            gap-4 sm:gap-6
          ">
            <MapPreview />
            <ActivityTypeScroller />
            <QuickStart 
              onHover={setIsButtonHovered}
            />
          </div>
        </div>
      </div>
    </section>
  );
} 