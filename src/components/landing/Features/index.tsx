import AIFeatureShowcase from './AIFeatureShowcase';
import ActivityTypesGrid from './ActivityTypesGrid';
import CommunityHighlights from './CommunityHighlights';

export default function Features() {
  return (
    <section className="relative py-24 bg-stone-900">
      <div className="max-w-7xl mx-auto px-4 space-y-24">
        <AIFeatureShowcase />
        <ActivityTypesGrid />
        <CommunityHighlights />
      </div>
    </section>
  );
} 