'use client';

import { useEffect, useRef, useState } from 'react';

interface VideoBackgroundProps {
  videoUrl: string;
  posterUrl?: string;
}

export default function VideoBackground({ videoUrl, posterUrl }: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasPlayError, setHasPlayError] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    console.log('VideoBackground mounted with URL:', videoUrl);
    let mounted = true;
    
    const playVideo = async () => {
      if (!videoRef.current) {
        console.log('Video ref not available');
        return;
      }
      
      try {
        console.log('Attempting to play video from URL:', videoUrl);
        videoRef.current.playbackRate = 0.75;
        await videoRef.current.play();
        if (mounted) {
          console.log('Video playing successfully');
          setHasPlayError(false);
        }
      } catch (err) {
        if (mounted) {
          setHasPlayError(true);
          console.error('Video playback error:', {
            err,
            videoElement: videoRef.current,
            readyState: videoRef.current?.readyState,
            networkState: videoRef.current?.networkState,
            videoError: videoRef.current?.error,
            currentSrc: videoRef.current?.currentSrc
          });
        }
      }
    };

    // Try to play when component mounts
    if (document.readyState === 'complete') {
      playVideo();
    } else {
      window.addEventListener('load', playVideo);
    }

    // Try to play again when user interacts with the page
    const handleInteraction = () => {
      if (hasPlayError) {
        console.log('Retrying video playback after user interaction');
        playVideo();
      }
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);

    return () => {
      mounted = false;
      window.removeEventListener('load', playVideo);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, [hasPlayError, videoUrl]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-stone-950">
      {/* Preload overlay while video loads */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-1000 ${
          isLoaded ? 'opacity-0' : 'opacity-100'
        }`} 
      />
      
      {!loadError && (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          poster={posterUrl}
          preload="auto"
          onLoadStart={() => console.log('Video load started')}
          onLoadedMetadata={() => console.log('Video metadata loaded')}
          onLoadedData={() => {
            console.log('Video loaded successfully:', {
              duration: videoRef.current?.duration,
              size: `${videoRef.current?.videoWidth}x${videoRef.current?.videoHeight}`,
              currentSrc: videoRef.current?.currentSrc
            });
            setIsLoaded(true);
          }}
          onError={(e) => {
            console.error('Video loading error:', {
              event: e,
              videoUrl,
              target: e.currentTarget,
              error: e.currentTarget?.error
            });
            setLoadError(true);
          }}
          className={`
            object-cover w-full h-full
            scale-105
            transition-all duration-[2000ms]
            ${isLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'}
          `}
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
      
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