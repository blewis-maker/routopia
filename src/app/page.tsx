'use client';

import { useEffect } from 'react';
import { LandingErrorBoundary } from '@/components/landing/ErrorBoundary';
import { AccessibleComponents } from '@/components/landing/AccessibilityEnhancements';
import { LandingAnalytics } from '@/utils/analytics';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';

export default function Home() {
  useEffect(() => {
    LandingAnalytics.trackPageView();
  }, []);

  return (
    <>
      <AccessibleComponents.SkipLink />
      <LandingErrorBoundary>
        <main id="main-content" className="relative min-h-screen">
          <Hero />
          <Features />
        </main>
      </LandingErrorBoundary>
    </>
  );
}