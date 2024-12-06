'use client';

import { useState } from 'react';
import { CategoryBrowser } from '@/components/poi/CategoryBrowser';
import { SearchInterface } from '@/components/poi/SearchInterface';
import { FilterSystem } from '@/components/poi/FilterSystem';
import { RealTimeStatus } from '@/components/poi/RealTimeStatus';
import { BookingWidget } from '@/components/poi/BookingWidget';
import { Map } from '@/components/Map';
import { useAuth } from '@/hooks/useAuth';
import type { POICategory, POISearchResult } from '@/types/poi';

export default function POIExplorerPage() {
  const { session, status } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<POICategory | null>(null);
  const [searchResults, setSearchResults] = useState<POISearchResult[]>([]);
  const [filters, setFilters] = useState({});

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!session) {
    return null; // Protected by middleware, will redirect
  }

  return (
    <div className="flex h-screen">
      {/* Left Panel */}
      <div className="w-[400px] bg-stone-900 p-4 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6 text-white">Points of Interest</h1>
        
        <div className="space-y-6">
          {/* Search Interface */}
          <SearchInterface 
            onSearch={setSearchResults}
            selectedCategory={selectedCategory}
          />

          {/* Category Browser */}
          <CategoryBrowser
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
          />

          {/* Filter System */}
          <FilterSystem
            filters={filters}
            onFilterChange={setFilters}
            category={selectedCategory}
          />

          {/* Real-time Status */}
          <RealTimeStatus />

          {/* Booking Widget */}
          <BookingWidget />
        </div>
      </div>

      {/* Map View */}
      <div className="flex-1 relative">
        <Map
          pois={searchResults}
          filters={filters}
          selectedCategory={selectedCategory}
        />
      </div>
    </div>
  );
} 