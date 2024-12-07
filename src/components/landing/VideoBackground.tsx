'use client';

import { useEffect, useRef, useState } from 'react';

interface VideoBackgroundProps {
  videoUrl: string;
  posterUrl?: string;
}

export default function VideoBackground({ videoUrl, posterUrl }: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.75;
      
      // Ensure video plays
      const playVideo = async () => {
        try {
          await videoRef.current?.play();
        } catch (error) {
          console.error('Video autoplay failed:', error);
        }
      };
      
      playVideo();
    }
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      {/* Preload overlay while video loads */}
      <div 
        className={`absolute inset-0 bg-brand-text transition-opacity duration-1000 ${
          isLoaded ? 'opacity-0' : 'opacity-100'
        }`} 
      />
      
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        poster={posterUrl}
        onLoadedData={() => setIsLoaded(true)}
        className={`
          object-cover w-full h-full
          scale-105
          transition-all duration-[2000ms]
          ${isLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'}
        `}
      >
        <source src={videoUrl} type="video/mp4" />
      </video>
      
      {/* Multiple gradient overlays for better text contrast */}
      <div className="absolute inset-0">
        {/* Top vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent" />
        
        {/* Bottom vignette - stronger for text */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        {/* Side vignettes */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
      </div>

      {/* Subtle noise texture */}
      <div
        className="absolute inset-0 mix-blend-overlay opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
} 