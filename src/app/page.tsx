'use client';

import { useState } from 'react';
import SignUpModal from '@/components/SignUpModal';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      <div 
        className="absolute inset-0 z-0 bg-black/60"
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-white px-4">
        <div className="flex items-center mb-6">
          <img 
            src="/icon.svg" 
            alt=""
            className="h-12 w-12 mr-3"
          />
          <h1 className="text-6xl font-bold">
            Your AI Route
            <div className="text-emerald-400">Planning Companion</div>
          </h1>
        </div>
        
        <p className="text-xl mb-8 text-center max-w-2xl">
          Plan your next adventure with AI-powered inspiration.
        </p>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 px-8 rounded-lg transition-colors"
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