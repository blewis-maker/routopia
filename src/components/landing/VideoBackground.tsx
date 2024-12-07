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
      videoRef.current.playbackRate = 0.75; // Slow down the video slightly for better visual impact
    }
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        poster={posterUrl}
        onLoadedData={() => setIsLoaded(true)}
        className={`object-cover w-full h-full scale-105 transition-all duration-[2000ms] ${
          isLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'
        }`}
      >
        <source src={videoUrl} type="video/mp4" />
      </video>
      
      {/* Enhanced gradient overlays for better text readability */}
      <div className="absolute inset-0">
        {/* Top gradient - subtle darkening */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-text/40 to-transparent" />
        
        {/* Bottom gradient - stronger for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-text/90 via-brand-text/25 to-transparent" />
        
        {/* Additional side vignette for depth */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-brand-text/30" />
      </div>

      {/* Refined noise texture with reduced opacity */}
      <div
        className="absolute inset-0 mix-blend-overlay opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
} 