'use client';

import React from 'react';
import { HeroBackground } from './HeroBackground';
import { HeroContent } from './HeroContent';

interface HeroProps {
  videoSrc: string;
  fallbackImageSrc: string;
  title: {
    main: string;
    highlight: string;
  };
  subtitle: string;
  ctaButtons: {
    primary: {
      text: string;
      href: string;
    };
    secondary: {
      text: string;
      href: string;
    };
  };
}

export const Hero = ({
  videoSrc,
  fallbackImageSrc,
  title,
  subtitle,
  ctaButtons,
}: HeroProps) => {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      <HeroBackground videoSrc={videoSrc} fallbackImageSrc={fallbackImageSrc} />
      <HeroContent title={title} subtitle={subtitle} ctaButtons={ctaButtons} />
    </div>
  );
};