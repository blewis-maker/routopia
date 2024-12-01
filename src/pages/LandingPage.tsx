import React from 'react';
import { LocationSearch } from '@/components/search/LocationSearch';
import { MapPreview } from '@/components/map/MapPreview';
import { ActivityTypeScroller } from '@/components/activity/ActivityTypeScroller';
import { QuickStart } from '@/components/onboarding/QuickStart';
import { AIFeatureShowcase } from '@/components/showcase/AIFeatureShowcase';
import { ActivityTypesGrid } from '@/components/activity/ActivityTypesGrid';
import { CommunityHighlights } from '@/components/community/CommunityHighlights';

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <LocationSearch 
            onSearch={(location) => {/* Handle search */}}
            recentSearches={[]}
          />
          <div className="hero-supporting">
            <MapPreview />
            <ActivityTypeScroller />
            <QuickStart />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="main-content">
        <AIFeatureShowcase />
        <ActivityTypesGrid />
        <CommunityHighlights />
      </section>
    </div>
  );
} 