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
    console.log('VideoBackground mounted, videoUrl:', videoUrl);
    let mounted = true;
    
    const playVideo = async () => {
      if (!videoRef.current) {
        console.log('Video ref not available');
        return;
      }
      
      try {
        console.log('Attempting to play video');
        videoRef.current.playbackRate = 0.75;
        await videoRef.current.play();
        if (mounted) {
          console.log('Video playing successfully');
          setHasPlayError(false);
        }
      } catch (err) {
        console.error('Error playing video:', err);
        if (mounted) {
          setHasPlayError(true);
        }
      }
    };

    if (document.readyState === 'complete') {
      console.log('Document ready, playing video');
      playVideo();
    } else {
      console.log('Document not ready, adding load listener');
      window.addEventListener('load', playVideo);
    }

    const handleInteraction = () => {
      if (hasPlayError) {
        console.log('User interaction detected, retrying video');
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
            console.log('Video loaded successfully');
            setIsLoaded(true);
          }}
          onError={(e) => {
            console.error('Video loading error:', e);
            setLoadError(true);
          }}
          style={{ 
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0 
          }}
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
      
      {/* Gradient overlays */}
      <div className="absolute inset-0 z-[1]">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
      </div>

      {/* Noise texture */}
      <div
        className="absolute inset-0 mix-blend-overlay opacity-[0.02] z-[2]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
} 