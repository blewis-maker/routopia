'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import SignUpModal from '@/components/SignUpModal';
import Image from 'next/image';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const searchParams = useSearchParams();

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center text-center p-4">
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
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-white">
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
        
        <p className="text-xl mb-12 text-center max-w-2xl text-stone-200">
          Plan your next adventure with AI-powered inspiration.
        </p>

        <button 
          onClick={() => setIsModalOpen(true)}
          onMouseEnter={() => setIsButtonHovered(true)}
          onMouseLeave={() => setIsButtonHovered(false)}
          className="text-xl font-semibold px-8 py-3 rounded-lg
            bg-gradient-to-r from-teal-400 to-emerald-400
            text-white
            transform transition-all duration-300
            hover:scale-105 shadow-lg"
        >
          Start Exploring
        </button>
      </div>

      <SignUpModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </main>
  );
}