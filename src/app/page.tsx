'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import SignUpModal from '@/components/SignUpModal';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('signin') === 'true') {
      setIsModalOpen(true);
    }
  }, [searchParams]);

  return (
    <div className="relative min-h-screen">
      {/* Video Background */}
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
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-white px-4">
        <div className="flex items-center mb-8">
          <img 
            src="/routopia-logo.png"
            alt="Routopia"
            className={`h-16 w-16 mr-4 transition-all duration-300 ${
              isButtonHovered ? 'animate-logo-active-large' : ''
            }`}
            width={64}
            height={64}
          />
          <h1 className="text-5xl font-bold leading-tight">
            Your AI Route
            <div className="bg-gradient-to-r from-teal-400 to-emerald-400 text-transparent bg-clip-text whitespace-nowrap leading-normal">
              Planning Companion
            </div>
          </h1>
        </div>
        
        <p className="text-xl mb-8 text-center max-w-2xl text-stone-200">
          Plan your next adventure with AI-powered inspiration.
        </p>

        <button
          onClick={() => setIsModalOpen(true)}
          onMouseEnter={() => setIsButtonHovered(true)}
          onMouseLeave={() => setIsButtonHovered(false)}
          className="bg-teal-600 hover:bg-teal-500 
            text-white font-bold py-3 px-8 rounded-lg 
            transition-all duration-300 hover:-translate-y-0.5 
            shadow-lg hover:shadow-teal-500/25
            animate-pulse-teal"
        >
          Get Started
        </button>
      </div>

      <SignUpModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}