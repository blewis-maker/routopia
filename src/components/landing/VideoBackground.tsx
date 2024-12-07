'use client';

import React from 'react';

interface VideoBackgroundProps {
  videoUrl: string;
  fallbackImage?: string;
}

export default function VideoBackground({ videoUrl, fallbackImage }: VideoBackgroundProps) {
  return (
    <>
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 z-0" />

      {/* Video background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute min-w-full min-h-full object-cover"
          poster={fallbackImage}
        >
          <source src={videoUrl} type="video/mp4" />
          {/* Fallback for browsers that don't support video */}
          {fallbackImage && (
            <img
              src={fallbackImage}
              alt="Background"
              className="absolute min-w-full min-h-full object-cover"
            />
          )}
        </video>
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
    </>
  );
} 